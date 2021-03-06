const puppeteer = require('puppeteer');
const axios = require('axios');
const scrape = require('./scrape');
const models = require('../db/models');

let browser;

const createHolding = async holding => {
  try {
    const dbHolding = await models.Holdings.create(holding);
    return dbHolding;
  } catch (error) {
    console.error(error);
  }
};

const createWeight = async (fund, holding, weight) => {
  try {
    const dbWeight = await models.Weights.create({
      fundId: fund,
      holdingId: holding,
      weight: weight
    });
    return dbWeight;
  } catch (error) {
    console.error(error);
  }
};

//this function is checking for any reations on the join table that are no longer valid
const validateWeights = async (fundId, scrapedData, type) => {
  let removedHoldings = [];
  try {
    //checking for extra holdings
    let { dataValues } = await models.Funds.findOne({
      where: {
        id: fundId
      },
      include: [
        {
          model: models.Holdings
        }
      ]
    });
    for (let i = 0; i < dataValues.holdings.length; i++) {
      let holding = dataValues.holdings[i];
      try {
        if (
          holding.dataValues.type === type &&
          scrapedData.indexOf(holding.dataValues.name) === -1
        ) {
          // delete holding association if it is no longer valid
          await models.Weights.destroy({
            where: {
              fundId: fundId,
              holdingId: holding.dataValues.id
            }
          });
          removedHoldings.push(holding);
        }
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    console.error(error);
  }
  return removedHoldings;
};

const updateHoldings = async (dbFund, scrapedData, type) => {
  let holdings = [];
  for (let i = 0; i < scrapedData.length; i++) {
    let holding = scrapedData[i];
    try {
      //
      let dbHolding = await models.Holdings.findOne({
        where: {
          name: Object.keys(holding)[0]
        }
      });
      //create holding if it does not exist
      if (!dbHolding) {
        dbHolding = await createHolding({
          name: Object.keys(holding)[0],
          type: type
        });
      }
      // create or update weights
      let weight = await models.Weights.findOne({
        where: {
          fundId: dbFund.dataValues.id,
          holdingId: dbHolding.dataValues.id
        }
      });
      if (!weight) {
        weight = await createWeight(
          dbFund.dataValues.id,
          dbHolding.dataValues.id,
          holding[Object.keys(holding)[0]]
        );
      }
      //return holding;
      holdings.push(holding);
    } catch (error) {
      console.error(error);
    }
  }
  let updatedHoldings = await Promise.all(holdings).catch(err =>
    console.error(err)
  );

  console.log(updatedHoldings.length + ' holdings checked and or updated');
  //if holdings change validate weight entries to remove old holdings
  let toValidate = scrapedData.map(el => Object.keys(el)[0]);
  validateWeights(dbFund.dataValues.id, toValidate, type);
};

// eslint-disable-next-line complexity
const getData = async () => {
  try {
    // getting funds json file
    const { data } = await axios.get(
      'https://www.ssga.com/bin/v1/ssmp/fund/fundfinder?country=us&language=en&role=intermediary&product=etfs&ui=fund-finder'
    );
    const etfs = data.data.us.funds.etfs.overview.datas;

    //scraping and modifying data on each fund returned
    for (let i = 0; i < etfs.length; i++) {
      let etf = etfs[i];
      let newFund = false;
      try {
        browser = await puppeteer.launch({
          ignoreHTTPSErrors: true,
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          timeout: 3000000
        });
        const scrapedData = await scrape(
          browser,
          `https://www.ssga.com${etf.fundUri}`
        );
        // check to see if fund already exists in DB, if not create it
        let dbFund = await models.Funds.findOne({
          where: {
            ticker: etf.fundTicker
          },
          include: [
            {
              model: models.Holdings
            }
          ]
        });
        //if fund does not exist, create it
        if (!dbFund) {
          newFund = true;
          dbFund = await models.Funds.create({
            name: etf.fundName,
            ticker: etf.fundTicker,
            asOfDate: etf.asOfDate[1],
            description: scrapedData.description
          });
        }
        // check for and create top holdings if needed
        if (dbFund.dataValues.asOfDate !== etf.asOfDate[1] || newFund) {
          if (scrapedData.topHoldings) {
            await updateHoldings(
              dbFund,
              scrapedData.topHoldings,
              'topHoldings'
            );
          }
          // check and create sectors if needed
          if (scrapedData.sectorWeights) {
            await updateHoldings(dbFund, scrapedData.sectorWeights, 'sector');
          }
          if (scrapedData.countryWeights) {
            await updateHoldings(dbFund, scrapedData.countryWeights, 'country');
          }
        }
        if (dbFund.dataValues.asOfDate !== etf.asOfDate[1]) {
          console.log('updating fund');
          await dbFund.update({
            name: etf.fundName,
            ticker: etf.fundTicker,
            asOfDate: etf.asOfDate[1],
            description: scrapedData.description
          });
        }
      } catch (error) {
        console.error(error);
      }
      browser.close();
    }
  } catch (error) {
    browser.close();
    console.error(error);
  }
  browser.close();
};

const runGetData = async () => {
  await getData().then(() => {
    console.log('done');
  });
};

runGetData();

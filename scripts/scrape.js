const scrape = async (browser, url) => {
  try {
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 3000000
    });

    const result = await page.evaluate(() => {
      const description = document
        .getElementById('overview')
        .getElementsByClassName('comp-text')[0]
        .getElementsByClassName('content')[0].firstChild.textContent;
      let topHoldings = [];
      const holdings = document.getElementsByClassName('fund-top-holdings')[0];
      if (holdings) {
        for (
          let i = 1;
          i < holdings.getElementsByClassName('label').length;
          i++
        ) {
          let holdingName = holdings.getElementsByClassName('label')[i]
            .textContent;
          if (
            topHoldings.map(el => Object.keys(el)[0]).indexOf(holdingName) > -1
          ) {
            // fixes bug where top holding is listed twice for some funds
            holdingName = holdingName + ' - 2';
          }
          topHoldings.push({ [holdingName]: null });
        }
      }
      const sectors = document.getElementsByClassName(
        'fund-sector-breakdown'
      )[0];
      const sectorList = [];
      if (sectors) {
        for (
          let i = 1;
          i < sectors.getElementsByClassName('label').length;
          i++
        ) {
          const sectorLabel = sectors.getElementsByClassName('label')[i]
            .textContent;
          const sectorWeight = sectors.getElementsByClassName('data')[i]
            .textContent;
          sectorList.push({
            [sectorLabel]: Number(
              sectorWeight.slice(0, sectorWeight.length - 1)
            )
          });
        }
      }
      const countries = document.getElementsByClassName(
        'geographical-chart'
      )[0];
      const countryWeights = [];
      if (countries) {
        for (
          let i = 1;
          i < countries.getElementsByClassName('label').length;
          i++
        ) {
          const countryName = countries.getElementsByClassName('label')[i]
            .textContent;
          const countryWeight = countries.getElementsByClassName('data')[i]
            .textContent;
          countryWeights.push({
            [countryName]: Number(
              countryWeight.slice(0, countryWeight.length - 1)
            )
          });
        }
      }

      return {
        description: description,
        sectorWeights: sectorList,
        countryWeights: countryWeights,
        topHoldings: topHoldings
      };
    });
    return result;
  } catch (error) {
    console.error(error);
  }
};

module.exports = scrape;

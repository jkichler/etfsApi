const router = require('express').Router()
const models = require('../db/models')
const cookieParser = require('cookie-parser');
module.exports = router;

router.use(cookieParser());

router.get('/:id', async (req, res, next) => {
  try {
    if (req.cookies['connect.sid'] && req.user) {
    const data = await models.Funds.findOne({
      where: {
        ticker: req.params.id.toUpperCase()
      },
      include: [{
        model: models.Holdings
      }]
    })
    res.status(200).json({
      name: data.name,
      ticker: data.ticker,
      asOfDate: data.asOfDate,
      description: data.description,
      topTenHoldings: data.holdings.filter(holding => holding.type === 'topHoldings').map(holding => holding.name),
      sectorHoldings: data.holdings.filter(holding => holding.type === 'sector').map(holding => {
        return {
          name: holding.name,
          weight: String(holding.weights.weight) + '%'
        }
      }),
      countryHoldings: data.holdings.filter(holding => holding.type === 'country').map(holding => {
        return {
          name: holding.name,
          weight: String(holding.weights.weight) + '%'
        }
      })
    })
  } else {
    res.status(401).send('Login for API access')
  }
  } catch (error) {
    next(error);
  }
});


router.get('/', async (req, res, next) => {
  try {
    if (req.cookies['connect.sid'] && req.user) {
    const data = await models.Funds.findAll().map(fund => fund.ticker)
    res.status(200).json(data)
    } else {
      res.status(401).send('Login for API access')
    }
  } catch (error) {
    next(error);
  }
});

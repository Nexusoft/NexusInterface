import Request from "request";
import TYPE from "../../actiontypes"
 const actionsCreators = 
  binanceDepthLoader () =>{
 return dispatch => { Request(
    {
      url: "https://api.binance.com/api/v1/depth?symbol=NXSBTC",
      json: true
    },
    (error, response, body) => {
      if (response.statusCode === 200) {
        let res = {
          sell: body.asks
            .map(ele => {
              return {
                Volume: parseFloat(ele[1]),
                Price: parseFloat(ele[0])
              };
            })
            .sort((a, b) => b.Price - a.Price),
          buy: body.bids
            .map(ele => {
              return {
                Volume: parseFloat(ele[1]),
                Price: parseFloat(ele[0])
              };
            })
            .sort((a, b) => b.Price - a.Price)
        };
        dispatch({ type: TYPE.BINANCE_ORDERBOOK, payload: res })
        
        // this.props.marketDataLoaded();
      }
    }}
  );}
  // Request(
  //   {
  //     url: "https://api.binance.com/api/v1/ticker/24hr?symbol=NXSBTC",
  //     json: true
  //   },
  //   (error, response, body) => {
  //     if (response.statusCode === 200) {
  //       this.props.binance24(body);
  //     }
  //   }
  // );
  // Request(
  //   {
  //     url: "https://www.cryptopia.co.nz/api/GetMarket/NXS_BTC",
  //     json: true
  //   },
  //   (error, response, body) => {
  //     if (response.statusCode === 200) {
  //       this.props.cryptopia24(body.Data);
  //     }
  //   }
  // );
  // Request(
  //   {
  //     url: "https://www.cryptopia.co.nz/api/GetMarketOrders/NXS_BTC",
  //     json: true
  //   },
  //   (error, response, body) => {
  //     if (response.statusCode === 200) {
  //       let res = {
  //         buy: body.Data.Buy.sort((a, b) => b.Price - a.Price).map(e => {
  //           return { Volume: e.Volume, Price: e.Price };
  //         }),
  //         sell: body.Data.Sell.sort((a, b) => b.Price - a.Price).map(e => {
  //           return { Volume: e.Volume, Price: e.Price };
  //         })
  //       };
  //       this.props.cryptopiaOB(res);
  //     }
  //   }
  // );
  // Request(
  //   {
  //     url:
  //       "https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-nxs",
  //     json: true
  //   },
  //   (error, response, body) => {
  //     if (response.statusCode === 200) {
  //       this.props.bittrex24(body.result[0]);
  //     }
  //   }
  // );
  // Request(
  //   {
  //     url:
  //       "https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-NXS&type=both",
  //     json: true
  //   },
  //   (error, response, body) => {
  //     if (response.statusCode === 200) {
  //       let res = {
  //         buy: body.result.buy.sort((a, b) => b.Rate - a.Rate).map(e => {
  //           return { Volume: e.Quantity, Price: e.Rate };
  //         }),
  //         sell: body.result.sell.sort((a, b) => b.Rate - a.Rate).map(e => {
  //           return { Volume: e.Quantity, Price: e.Rate };
  //         })
  //       };
  //       this.props.bittrexOB(res);
  //     }
  //   }
  // );
// };

export default actionsCreators
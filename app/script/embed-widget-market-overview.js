! function() {
    "use strict";

    function e(e) {
        return ({
            ar_AE: "ar",
            au: "au",
            ca: "ca",
            de_DE: "de",
            en: "www",
            es: "es",
            fa_IR: "ir",
            fr: "fr",
            he_IL: "il",
            hu_HU: "hu",
            id: "id",
            in: "in",
            it: "it",
            ja: "jp",
            kr: "kr",
            ms_MY: "my",
            pl: "pl",
            br: "br",
            ru: "ru",
            sv_SE: "se",
            th_TH: "th",
            tr: "tr",
            uk: "uk",
            vi_VN: "vn",
            zh_CN: "cn",
            zh_TW: "tw"
        }[e] || "www") + ".tradingview.com"
    }

    function t(t, r) {
        void 0 === r && (r = {}), r.locale = r.locale || "en";
        var o, i = g[r.widgetName],
            a = i ? i.en : g.default;
        o = i && i[t] ? i[t] : a;
        var n = o.replace("{0}", '<span style="color: #3BB3E4">TradingView</span>'),
            s = e(r.locale),
            c = document.createElement("a");
        return c.setAttribute("ref", "nofollow noopener"), c.setAttribute("target", "_blank"), c.setAttribute("href", "http://" + s + (r.utmString ? "?" + r.utmString : "")), c.style.color = "#ADAEB0", c.style.fontFamily = "'Trebuchet MS', Tahoma, Arial, sans-serif", c.style.fontSize = "13px", c.innerHTML = n, c.outerHTML
    }

    function r() {
        return "www.tradingview.com" === location.host || "wwwcn.tradingview.com" === location.host || "dwq4do82y8xi7.cloudfront.net" === location.host || "s.tradingview.com" === location.host || "i18n.tradingview.com" === location.host || "partial.tradingview.com" === location.host || location.host.match(/^[a-z]{2}\.tradingview\.com/) || location.host.match(/prod-[^.]+.tradingview.com/) ? "battle" : -1 !== location.href.indexOf("tradingview.com") ? "staging" : location.host.match(/webcharts/) ? "staging_local" : (location.host.match(/^localhost(:\d+)?$/), "local")
    }
    var o = {
            events: "external-embedding/embed-widget-events.js",
            hotlists: "external-embedding/embed-widget-hotlists.js",
            marketoverview: "external-embedding/embed-widget-market-overview.js",
            tickers: "external-embedding/embed-widget-tickers.js",
            forex_cross_rates: "external-embedding/embed-widget-forex-cross-rates.js",
            market_quotes: "external-embedding/embed-widget-market-quotes.js",
            forex_heat_map: "external-embedding/embed-widget-forex-heat-map.js",
            screener: "external-embedding/embed-widget-screener.js"
        },
        i = {
            localPrefix: "/static/bundles/",
            cloudfrontBase: "https://s3.tradingview.com/",
            widgets: o
        },
        a = {
            en: "en",
            ca: "en",
            it: "it",
            vi_VN: "vi",
            au: "en",
            th_TH: "th",
            id: "id_ID",
            es: "es",
            ru: "ru",
            tr: "tr",
            hu_HU: "hu_HU",
            pl: "pl",
            fr: "fr",
            zh_TW: "zh_TW",
            ar_AE: "ar",
            ms_MY: "ms_MY",
            br: "pt",
            de_DE: "de",
            ja: "ja",
            fa_IR: "fa",
            zh_CN: "zh",
            sv_SE: "sv",
            kr: "ko",
            uk: "en",
            he_IL: "he_IL",
            in: "en"
        },
        n = {
            en: "Economic Calendar by {0}",
            ar: "Ø§Ù„Ù…ÙÙƒØ±Ø© Ø§Ù„Ø§Ù‚ØªØµØ§Ø¯ÙŠØ© Ø¨ÙˆØ§Ø³Ø·Ø© â€Ž{0}â€Ž",
            cs: "Economic Calendar by {0}",
            da_DK: "Economic Calendar by {0}",
            de: "Wirtschaftskalender von {0}",
            el: "Economic Calendar by {0}",
            es: "Calendario cconÃ³mico por {0}",
            et_EE: "Economic Calendar by {0}",
            fa: "Economic Calendar by {0}",
            fr: "Calendrier Ã©conomique par {0}",
            he_IL: "Economic Calendar by {0}",
            hu_HU: "GazdasÃ¡gi NaptÃ¡rat biztosÃ­tja: {0}",
            id_ID: "Kalender Ekonomi oleh {0}",
            it: "Calendario economico da {0}",
            ja: "{0}ã«ã‚ˆã‚‹çµŒæ¸ˆã‚«ãƒ¬ãƒ³ãƒ€ãƒ¼",
            ko: "{0} ì œê³µ ì´ì½”ë…¸ë¯¹ ìº˜ë¦°ë”",
            ms_MY: "Kalendar ekonomi mengikut {0}",
            nl_NL: "Economic Calendar by {0}",
            no: "Economic Calendar by {0}",
            pl: "Kalendarz ekonomiczny od {0}",
            pt: "CalendÃ¡rio EconÃ´mico por {0}",
            ro: "Economic Calendar by {0}",
            ru: "Ð­ÐºÐ¾Ð½Ð¾Ð¼Ð¸Ñ‡ÐµÑÐºÐ¸Ð¹ ÐºÐ°Ð»ÐµÐ½Ð´Ð°Ñ€ÑŒ Ð¾Ñ‚ {0}",
            sk_SK: "Economic Calendar by {0}",
            sv: "Economic Calendar by {0}",
            th: "à¸›à¸à¸´à¸—à¸´à¸™à¹€à¸¨à¸£à¸©à¸à¸à¸´à¸ˆà¹‚à¸”à¸¢ {0}",
            tr: "Ekonomik Takvimi saÄŸlayan {0}",
            vi: "Lá»‹ch Kinh Táº¿ bá»Ÿi {0}",
            zh: "{0}çš„è´¢ç»æ—¥åŽ†",
            zh_TW: "è²¡ç¶“æ—¥æ›†ç”±{0}æä¾›"
        },
        s = {
            en: "Forex Quotes by {0}",
            ar: "Ø£Ø³Ø¹Ø§Ø± Ø§Ù„Ø¹Ù…Ù„Ø§Øª Ø¨ÙˆØ§Ø³Ø·Ø© â€Ž{0}â€Ž",
            cs: "Forex Quotes by {0}",
            da_DK: "Forex Quotes by {0}",
            de: "Devisenkurse von {0}",
            el: "Forex Quotes by {0}",
            es: "Cotizaciones del mercado de divisas por {0}",
            et_EE: "Forex Quotes by {0}",
            fa: "Forex Quotes by {0}",
            fr: "Cotations forex par {0}",
            he_IL: "Forex Quotes by {0}",
            hu_HU: "Forex Ãrfolyamokat biztosÃ­tja: {0}",
            id_ID: "Kutipan Forex oleh {0}",
            it: "Quotazioni Forex da {0}",
            ja: "{0}ã«ã‚ˆã‚‹FXè¦‹ç©ã‚‚ã‚Š",
            ko: "{0} ì œê³µ í¬ë ‰ìŠ¤ ì¿¼íŠ¸",
            ms_MY: "Sebutharga Forex mengikut {0}",
            nl_NL: "Forex Quotes by {0}",
            no: "Forex Quotes by {0}",
            pl: "Notowania Forex od {0}",
            pt: "CotaÃ§Ãµes Forex por {0}",
            ro: "Forex Quotes by {0}",
            ru: "Ð¤Ð¾Ñ€ÐµÐºÑ Ð´Ð°Ð½Ð½Ñ‹Ðµ Ð¾Ñ‚ {0}",
            sk_SK: "Forex Quotes by {0}",
            sv: "Forex Quotes by {0}",
            th: "à¹à¸ˆà¹‰à¸‡à¸£à¸²à¸„à¸²à¸Ÿà¸­à¹€à¸£à¹‡à¸à¸‹à¹Œà¹‚à¸”à¸¢ {0}",
            tr: "Forex FiyatlarÄ± saÄŸlayan {0}",
            vi: "BÃ¡o giÃ¡ Forex bá»Ÿi {0}",
            zh: "{0}çš„å¤–æ±‡è¡Œæƒ…",
            zh_TW: "å¤–åŒ¯å ±åƒ¹ç”±{0}æä¾›"
        },
        c = {
            en: "Market Movers by {0}",
            ar: "ØªØ­Ø±ÙƒØ§Øª Ø§Ù„Ø£Ø³ÙˆØ§Ù‚ Ù…Ù† Ù‚Ø¨Ù„â€Ž{0}â€Ž",
            cs: "Market Movers by {0}",
            da_DK: "Market Movers by {0}",
            de: "Market Movers von {0}",
            el: "Market Movers by {0}",
            es: "Movimientos del mercado por {0}",
            et_EE: "Market Movers by {0}",
            fa: "Market Movers by {0}",
            fr: "Les plus actifs sur les marchÃ©s par {0}",
            he_IL: "Market Movers by {0}",
            hu_HU: "Piaci MozgatÃ³kat biztosÃ­tja: {0}",
            id_ID: "Penggerak Pasar oleh {0}",
            it: "Market mover da {0}",
            ja: "{0}ã«ã‚ˆã‚‹å¸‚å ´å‹•å‘",
            ko: "{0} ì œê³µ ë§ˆì¼“ ì£¼ë„ì£¼",
            ms_MY: "Penggerak pasaran mengikut {0}",
            nl_NL: "Market Movers by {0}",
            no: "Market Movers by {0}",
            pl: "Ruchy na rynku wg {0}",
            pt: "Destaques do Mercado por {0}",
            ro: "Market Movers by {0}",
            ru: "Ð›Ð¸Ð´ÐµÑ€Ñ‹ Ñ€Ñ‹Ð½ÐºÐ° Ð¾Ñ‚ {0}",
            sk_SK: "Market Movers by {0}",
            sv: "Market Movers by {0}",
            th: "à¸œà¸¸à¹‰à¹€à¸„à¸¥à¸·à¹ˆà¸­à¸™à¹„à¸«à¸§à¸•à¸¥à¸²à¸”à¹‚à¸”à¸¢ {0}",
            tr: "Borsa Ã–zeti saÄŸlayan {0}",
            vi: "Biáº¿n Ä‘á»™ng Thá»‹ trÆ°á»ng bá»Ÿi {0}",
            zh: "{0}çš„å¸‚åœºåŠ¨å‘",
            zh_TW: "å¸‚å ´å‹•å‘ç”±{0}æä¾›"
        },
        h = {
            en: "Market Quotes by {0}",
            ar: "Ø£Ø³Ø¹Ø§Ø± Ø§Ù„Ø³ÙˆÙ‚ Ø¨ÙˆØ§Ø³Ø·Ø© â€Ž{0}â€Ž",
            cs: "Market Quotes by {0}",
            da_DK: "Market Quotes by {0}",
            de: "Marktkurse von {0}",
            el: "Market Quotes by {0}",
            es: "Cotizaciones del mercado por {0}",
            et_EE: "Market Quotes by {0}",
            fa: "Market Quotes by {0}",
            fr: "Cotations des marchÃ©s par {0}",
            he_IL: "Market Quotes by {0}",
            hu_HU: "Piaci Ãrfolyamokat biztosÃ­tja: {0}",
            id_ID: "Kutipan Pasar oleh {0}",
            it: "Quotazioni di mercato da {0}",
            ja: "{0}ã«ã‚ˆã‚‹å¸‚å ´ã®ç›¸å ´",
            ko: "{0} ì œê³µ ë§ˆì¼“ ì¿¼íŠ¸",
            ms_MY: "Sebutharga pasaran mengikut {0}",
            nl_NL: "Market Quotes by {0}",
            no: "Market Quotes by {0}",
            pl: "Notowania rynkowe od {0}",
            pt: "CotaÃ§Ãµes de Mercado por {0}",
            ro: "Market Quotes by {0}",
            ru: "Ð Ñ‹Ð½Ð¾Ñ‡Ð½Ñ‹Ðµ Ð´Ð°Ð½Ð½Ñ‹Ðµ Ð¿Ñ€ÐµÐ´Ð¾ÑÑ‚Ð°Ð²Ð»ÐµÐ½Ñ‹ {0}",
            sk_SK: "Market Quotes by {0}",
            sv: "Market Quotes by {0}",
            th: "à¹à¸ˆà¹‰à¸‡à¸£à¸²à¸„à¸²à¸•à¸¥à¸²à¸”à¹‚à¸”à¸¢ {0}",
            tr: "Piyasa FiyatlarÄ±nÄ± saÄŸlayan {0}",
            vi: "BÃ¡o giÃ¡ Thá»‹ trÆ°á»ng bá»Ÿi {0}",
            zh: "{0}çš„å¸‚åœºè¡Œæƒ…",
            zh_TW: "å¸‚å ´å ±åƒ¹ç”±{0}æä¾›"
        },
        p = {
            en: "Quotes by {0}",
            ar: "Ø§Ù„Ø£Ø³Ø¹Ø§Ø± Ø¨ÙˆØ§Ø³Ø·Ø© â€Ž{0}â€Ž",
            cs: "Quotes by {0}",
            da_DK: "Quotes by {0}",
            de: "Kurse von {0}",
            el: "Quotes by {0}",
            es: "Cotizaciones por {0}",
            et_EE: "Quotes by {0}",
            fa: "Quotes by {0}",
            fr: "Cotations par {0}",
            he_IL: "Quotes by {0}",
            hu_HU: "JegyzÃ©sek {0} Ãltal",
            id_ID: "Kutipan oleh {0}",
            it: "Quotazioni da {0}",
            ja: "{0}ã«ã‚ˆã‚‹è¦‹ç©ã‚‚ã‚Š",
            ko: "{0} ì œê³µ ì¿¼íŠ¸",
            ms_MY: "Sebutharga mengikut {0}",
            nl_NL: "Quotes by {0}",
            no: "Quotes by {0}",
            pl: "Notowania od {0}",
            pt: "CotaÃ§Ãµes por {0}",
            ro: "Quotes by {0}",
            ru: "ÐšÐ¾Ñ‚Ð¸Ñ€Ð¾Ð²ÐºÐ¸ Ð¿Ñ€ÐµÐ´Ð¾ÑÑ‚Ð°Ð²Ð»ÐµÐ½Ñ‹ {0}",
            sk_SK: "Quotes by {0}",
            sv: "Quotes by {0}",
            th: "à¹à¸ˆà¹‰à¸‡à¸£à¸²à¸„à¸²à¹‚à¸”à¸¢ {0}",
            tr: "FiyatlarÄ± saÄŸlayan {0}",
            vi: "BÃ¡o giÃ¡ bá»Ÿi {0}",
            zh: "{0}çš„è¡Œæƒ…",
            zh_TW: "å ±åƒ¹ç”±{0}æä¾›"
        },
        l = {
            en: "Forex Heat Map by {0}",
            ar: "Ø®Ø±ÙŠØ·Ø© Ø§Ù„Ø¹Ù…Ù„Ø§Øª Ø§Ù„Ø£ÙƒØ«Ø± ØªØ­Ø±ÙƒÙ‹Ø§ Ø¨ÙˆØ§Ø³Ø·Ø©â€Ž{0}â€Ž",
            cs: "Forex Heat Map by {0}",
            da_DK: "Forex Heat Map by {0}",
            de: "Devisen Heat-Map von {0}",
            el: "Forex Heat Map by {0}",
            es: "Mapa de riesgos forex por {0}",
            et_EE: "Forex Heat Map by {0}",
            fa: "Forex Heat Map by {0}",
            fr: "Carte thermique du Forex par {0}",
            he_IL: "Forex Heat Map by {0}",
            hu_HU: "Forex hÅ‘tÃ©rkÃ©p {0} Ã¡ltal",
            id_ID: "Peta Panas Forex oleh {0}",
            it: "Mappa termica Forex di {0}",
            ja: "{0}ã«ã‚ˆã‚‹ç‚ºæ›¿ãƒ’ãƒ¼ãƒˆãƒžãƒƒãƒ—",
            ko: "{0} ì œê³µ í¬ë ‰ìŠ¤ ížˆíŠ¸ ë§µ",
            ms_MY: "Forex Heat Map oleh {0}",
            nl_NL: "Forex Heat Map by {0}",
            no: "Forex Heat Map by {0}",
            pl: "Mapa Cieplna Forex od {0}",
            pt: "Mapa de Calor Forex por {0}",
            ro: "Forex Heat Map by {0}",
            ru: "Ð¢ÐµÐ¿Ð»Ð¾Ð²Ð°Ñ ÐºÐ°Ñ€Ñ‚Ð° Ð²Ð°Ð»ÑŽÑ‚ Ð¾Ñ‚ {0}",
            sk_SK: "Forex Heat Map by {0}",
            sv: "Forex Heat Map by {0}",
            th: "à¸•à¸²à¸£à¸²à¸‡à¸Ÿà¸­à¹€à¸£à¹‡à¸à¸‹à¹Œà¸®à¸µà¸—à¹à¸¡à¸žà¹‚à¸”à¸¢ {0}",
            tr: "Forex SÄ±caklÄ±k HaritasÄ± saÄŸlayan {0}",
            vi: "Báº£n Ä‘á»“ Nhiá»‡t Forex bá»Ÿi {0}",
            zh: "{0}çš„å¤–æ±‡çƒ­å›¾",
            zh_TW: "å¤–åŒ¯ç†±å€åœ–ç”±{0}æä¾›"
        },
        d = {
            en: "Stock Screener by {0}",
            ar: "Ø¹Ø§Ø±Ø¶ Ø§Ù„Ø£Ø³Ù‡Ù… Ø¨ÙˆØ§Ø³Ø·Ø© â€Ž{0}â€Ž",
            cs: "Stock Screener by {0}",
            da_DK: "Stock Screener by {0}",
            de: "Aktien-Screener von {0}",
            el: "Stock Screener by {0}",
            es: "Filtrador de acciones por {0}",
            et_EE: "Stock Screener by {0}",
            fa: "Stock Screener by {0}",
            fr: "Stock Screener par {0}",
            he_IL: "Stock Screener by {0}",
            hu_HU: "RÃ©szvÃ©ny Screener {0} Ã¡ltal",
            id_ID: "Pemilah Saham oleh {0}",
            it: "Screener azioni di {0}",
            ja: "{0}ã«ã‚ˆã‚‹æ ªå¼éŠ˜æŸ„ã‚¹ã‚¯ãƒªãƒ¼ãƒŠãƒ¼",
            ko: "{0} ì œê³µ ìŠ¤íƒ ìŠ¤í¬ë¦¬ë„ˆ",
            ms_MY: "Penyaring Stok oleh {0}",
            nl_NL: "Stock Screener by {0}",
            no: "Stock Screener by {0}",
            pl: "Stock Screener by {0}",
            pt: "Rastreador de Fundamentos por {0}",
            ro: "Stock Screener by {0}",
            ru: "Ð¡ÐºÑ€Ð¸Ð½ÐµÑ€ Ð°ÐºÑ†Ð¸Ð¹ Ð¾Ñ‚ {0}",
            sk_SK: "Stock Screener by {0}",
            sv: "Stock Screener by {0}",
            th: "à¸•à¸±à¸§à¸Šà¹ˆà¸§à¸¢à¸„à¸±à¸”à¸à¸£à¸­à¸‡à¸«à¸¸à¹‰à¸™à¹‚à¸”à¸¢ {0}",
            tr: "{0} Hisse TakipÃ§isi",
            vi: "Lá»c Cá»• Phiáº¿u bá»Ÿi {0}",
            zh: "ç”±{0}æä¾›çš„è‚¡ç¥¨ç­›é€‰å™¨",
            zh_TW: "è‚¡ç¥¨ç¯©é¸å™¨ç”±{0}æä¾›"
        },
        u = {
            en: "Forex Screener by {0}",
            ar: "Ø¹Ø§Ø±Ø¶ Ø§Ù„ÙÙˆØ±ÙƒØ³ Ø¨ÙˆØ§Ø³Ø·Ø© â€Ž{0}â€Ž",
            cs: "Forex Screener by {0}",
            da_DK: "Forex Screener by {0}",
            de: "Devisen-Screener von {0}",
            el: "Forex Screener by {0}",
            es: "Filtrador de forex por {0}",
            et_EE: "Forex Screener by {0}",
            fa: "Forex Screener by {0}",
            fr: "Forex Screener par {0}",
            he_IL: "Forex Screener by {0}",
            hu_HU: "Forex Screener {0} Ã¡ltal",
            id_ID: "Pemilah Forex oleh {0}",
            it: "Screener forex di {0}",
            ja: "{0}ã«ã‚ˆã‚‹FXã‚¹ã‚¯ãƒªãƒ¼ãƒŠãƒ¼",
            ko: "{0} ì œê³µ í¬ë ‰ìŠ¤ ìŠ¤í¬ë¦¬ë„ˆ",
            ms_MY: "Penyaring Forex oleh {0}",
            nl_NL: "Forex Screener by {0}",
            no: "Forex Screener by {0}",
            pl: "Forex Screener by {0}",
            pt: "Rastreador Forex por {0}",
            ro: "Forex Screener by {0}",
            ru: "Ð¡ÐºÑ€Ð¸Ð½ÐµÑ€ Ð¤Ð¾Ñ€ÐµÐºÑ Ð¾Ñ‚ {0}",
            sk_SK: "Forex Screener by {0}",
            sv: "Forex Screener by {0}",
            th: "à¸•à¸±à¸§à¸Šà¹ˆà¸§à¸¢à¸„à¸±à¸”à¸à¸£à¸­à¸‡à¸Ÿà¸­à¹€à¸£à¹‡à¸à¸‹à¹Œà¹‚à¸”à¸¢ {0}",
            tr: "{0} Forex TakipÃ§isi",
            vi: "Lá»c Forex bá»Ÿi {0}",
            zh: "ç”±{0}æä¾›çš„å¤–æ±‡ç­›é€‰å™¨",
            zh_TW: "å¤–åŒ¯ç¯©é¸å™¨ {0}"
        },
        y = {
            en: "Cryptocurrencies Screener by {0}",
            ar: "Ø¹Ø§Ø±Ø¶ Ø§Ù„Ø¹Ù…Ù„Ø§Øª Ø§Ù„Ù…Ø´ÙØ±Ø© Ø¨ÙˆØ§Ø³Ø·Ø© â€Ž{0}â€Ž",
            cs: "Cryptocurrencies Screener by {0}",
            da_DK: "Cryptocurrencies Screener by {0}",
            de: "KryptowÃ¤hrungen-Screener von {0}",
            el: "Cryptocurrencies Screener by {0}",
            es: "Filtrador de criptodivisas por {0}",
            et_EE: "Cryptocurrencies Screener by {0}",
            fa: "Cryptocurrencies Screener by {0}",
            fr: "Screener de cryptodevises par {0}",
            he_IL: "Cryptocurrencies Screener by {0}",
            hu_HU: "KriptopÃ©nz Screener {0} Ã¡ltal",
            id_ID: "Pemilah Mata Uang Digital oleh {0}",
            it: "Screener cripto di {0}",
            ja: "{0}ã«ã‚ˆã‚‹ä»®æƒ³é€šè²¨ã‚¹ã‚¯ãƒªãƒ¼ãƒŠãƒ¼",
            ko: "{0} ì œê³µ í¬ë¦½í† ì»¤ëŸ°ì‹œ ìŠ¤í¬ë¦¬ë„ˆ",
            ms_MY: "Penyaring Matawang Kripto oleh {0}",
            nl_NL: "Cryptocurrencies Screener by {0}",
            no: "Cryptocurrencies Screener by {0}",
            pl: "Cryptocurrencies Screener by {0}",
            pt: "Rastreador de Criptomoedas por {0}",
            ro: "Cryptocurrencies Screener by {0}",
            ru: "Ð¡ÐºÑ€Ð¸Ð½ÐµÑ€ ÐºÑ€Ð¸Ð¿Ñ‚Ð¾Ð²Ð°Ð»ÑŽÑ‚ Ð¾Ñ‚ {0}",
            sk_SK: "Cryptocurrencies Screener by {0}",
            sv: "Cryptocurrencies Screener by {0}",
            th: "à¸•à¸±à¸§à¸Šà¹ˆà¸§à¸¢à¸„à¸±à¸”à¸à¸£à¸­à¸‡à¸ªà¸à¸¸à¸¥à¹€à¸‡à¸´à¸™à¸”à¸´à¸ˆà¸´à¸•à¸­à¸¥à¹‚à¸”à¸¢ {0}",
            tr: "{0} Kriptopara TakipÃ§isi",
            vi: "Lá»c Tiá»n Ä‘iá»‡n tá»­ bá»Ÿi {0}",
            zh: "ç”±{0}æä¾›çš„åŠ å¯†è´§å¸ç­›é€‰å™¨",
            zh_TW: "åŠ å¯†è²¨å¹£ç¯©é¸å™¨ {0}"
        },
        m = {
            en: "Cryptocurrency Market by {0}",
            ar: "Ø£Ø³ÙˆØ§Ù‚ Ø§Ù„Ø¹Ù…Ù„Ø§Øª Ø§Ù„Ù…Ø´ÙØ±Ø© Ø¨ÙˆØ§Ø³Ø·Ø© â€Ž{0}â€Ž",
            cs: "Cryptocurrency Market by {0}",
            da_DK: "Cryptocurrency Market by {0}",
            de: "KryptowÃ¤hrungsmarkt von {0}",
            el: "Cryptocurrency Market by {0}",
            es: "Mercado Criptodivisas por {0}",
            et_EE: "Cryptocurrency Market by {0}",
            fa: "Cryptocurrency Market by {0}",
            fr: "MarchÃ© des cryptodevises par {0}",
            he_IL: "Cryptocurrency Market by {0}",
            hu_HU: "Cryptocurrency Market by {0}",
            id_ID: "Pasar Mata Uang Digital oleh {0}",
            it: "Mercato criptovalute da {0}",
            ja: "{0}ä»®æƒ³é€šè²¨ãƒžãƒ¼ã‚±ãƒƒãƒˆ",
            ko: "{0} ì œê³µ í¬ë¦½í† ì»¤ëŸ°ì‹œ ë§ˆì¼“",
            ms_MY: "Pasaran Mata Wang Kripto oleh {0}",
            nl_NL: "Cryptocurrency Market by {0}",
            no: "Cryptocurrency Market by {0}",
            pl: "Cryptocurrency Market by {0}",
            pt: "Cryptocurrency Market by {0}",
            ro: "Cryptocurrency Market by {0}",
            ru: "ÐšÑ€Ð¸Ð¿Ñ‚Ð¾Ð²Ð°Ð»ÑŽÑ‚Ñ‹ Ð¿Ñ€ÐµÐ´Ð¾ÑÑ‚Ð°Ð²Ð»ÐµÐ½Ñ‹ {0}",
            sk_SK: "Cryptocurrency Market by {0}",
            sv: "Cryptocurrency Market by {0}",
            th: "à¸•à¸¥à¸²à¸”à¸ªà¸à¸¸à¸¥à¹€à¸‡à¸´à¸™à¸„à¸£à¸´à¸›à¹‚à¸• à¹‚à¸”à¸¢ {0}",
            tr: "Kriptopara PiyasasÄ± veri saÄŸlayÄ±cÄ± {0}",
            vi: "Cryptocurrency Market by {0}",
            zh: "Cryptocurrency Market by {0}",
            zh_TW: "åŠ å¯†è²¨å¹£å¸‚å ´ç”±{0}æä¾›"
        },
        b = {
            en: "Market Quotes by {0}",
            ar: "Ø£Ø³Ø¹Ø§Ø± Ø§Ù„Ø³ÙˆÙ‚ Ø¨ÙˆØ§Ø³Ø·Ø© â€Ž{0}â€Ž",
            cs: "Market Quotes by {0}",
            da_DK: "Market Quotes by {0}",
            de: "Marktkurse von {0}",
            el: "Market Quotes by {0}",
            es: "Cotizaciones del mercado por {0}",
            et_EE: "Market Quotes by {0}",
            fa: "Market Quotes by {0}",
            fr: "Cotations des marchÃ©s par {0}",
            he_IL: "Market Quotes by {0}",
            hu_HU: "Piaci Ãrfolyamokat biztosÃ­tja: {0}",
            id_ID: "Kutipan Pasar oleh {0}",
            it: "Quotazioni di mercato da {0}",
            ja: "{0}ã«ã‚ˆã‚‹å¸‚å ´ã®ç›¸å ´",
            ko: "{0} ì œê³µ ë§ˆì¼“ ì¿¼íŠ¸",
            ms_MY: "Sebutharga pasaran mengikut {0}",
            nl_NL: "Market Quotes by {0}",
            no: "Market Quotes by {0}",
            pl: "Notowania rynkowe od {0}",
            pt: "CotaÃ§Ãµes de Mercado por {0}",
            ro: "Market Quotes by {0}",
            ru: "Ð Ñ‹Ð½Ð¾Ñ‡Ð½Ñ‹Ðµ Ð´Ð°Ð½Ð½Ñ‹Ðµ Ð¿Ñ€ÐµÐ´Ð¾ÑÑ‚Ð°Ð²Ð»ÐµÐ½Ñ‹ {0}",
            sk_SK: "Market Quotes by {0}",
            sv: "Market Quotes by {0}",
            th: "à¹à¸ˆà¹‰à¸‡à¸£à¸²à¸„à¸²à¸•à¸¥à¸²à¸”à¹‚à¸”à¸¢ {0}",
            tr: "Piyasa FiyatlarÄ±nÄ± saÄŸlayan {0}",
            vi: "BÃ¡o giÃ¡ Thá»‹ trÆ°á»ng bá»Ÿi {0}",
            zh: "{0}çš„å¸‚åœºè¡Œæƒ…",
            zh_TW: "å¸‚å ´å ±åƒ¹ç”±{0}æä¾›"
        },
        g = {
            events: n,
            forexcrossrates: s,
            hotlists: c,
            marketoverview: h,
            tickers: p,
            forexheatmap: l,
            screener: d,
            forexscreener: u,
            cryptoscreener: y,
            cryptomktscreener: m,
            marketquotes: b,
            default: "by {0}"
        },
        f = function(e, t) {
            void 0 === t && (t = "json"), this.pathname = ("battle" === this._environment() ? "/" : i.localPrefix) + e, this.settingsFormat = t, this.matchedScripts = this._findScripts(), this._replaceAllScriptElements(this.matchedScripts)
        },
        k = {
            embedWidgetSitePath: {},
            widgetName: {},
            propertiesToWorkWith: {},
            utmInfo: {},
            hasOutsideHeader: {},
            iframeSrcBase: {},
            propertiesToSkipInHash: {},
            propertiesToGetParams: {},
            cloudfrontHost: {}
        };
    k.embedWidgetSitePath.get = function() {
        return ""
    }, k.widgetName.get = function() {
        return "basic"
    }, k.propertiesToWorkWith.get = function() {
        return []
    }, k.utmInfo.get = function() {
        return {
            utm_source: location.hostname,
            utm_medium: "widget",
            utm_campaign: this.widgetName
        }
    }, k.hasOutsideHeader.get = function() {
        return !1
    }, f.prototype._environment = function() {
        var e = r();
        return "local" === e && null === location.host.match(/^localhost(:\d+)?$/) && (e = "battle"), e
    }, f.prototype.prepareAndFilterData = function(e) {
        var t = this.propertiesToSkipInHash.concat(this.propertiesToWorkWith);
        for (var r in e) - 1 === t.indexOf(r) && delete e[r];
        return e
    }, k.iframeSrcBase.get = function() {
        var e = "";
        return "battle" === this._environment() ? e = "https://s.tradingview.com" : "staging" === this._environment() && -1 !== location.hostname.indexOf("beta.tradingview.com") && (e = "https://betacdn.tradingview.com"), this.settings.customer && this.propertiesToSkipInHash.includes("customer") && (e += "/" + this.settings.customer), e + this.embedWidgetSitePath
    }, k.propertiesToSkipInHash.get = function() {
        return []
    }, k.propertiesToGetParams.get = function() {
        return ["locale", "whitelabel"]
    }, k.cloudfrontHost.get = function() {
        var e = document.createElement("a");
        return e.href = i.cloudfrontBase, e.host
    }, f.prototype._findScripts = function() {
        var e, t = this,
            r = document.getElementsByTagName("script"),
            o = [],
            i = null;
        for (e = r.length; e--;) {
            var a = r[e].src;
            if (a) {
                i || (i = document.createElement("a")), i.href = a;
                var n = ("/" === i.pathname[0] ? "" : "/") + i.pathname,
                    s = i.host === t.cloudfrontHost || "d33t3vvu2t2yu5.cloudfront.net" === i.host;
                n !== t.pathname || "battle" === t._environment() && !s || o.push(r[e])
            }
        }
        return o
    }, f.prototype._replaceAllScriptElements = function(e) {
        for (var t = this, r = e.length; r--;) t._replaceScript(e[r])
    }, f.prototype._replaceScript = function(e) {
        var t;
        if (this.script = e, "json" === this.settingsFormat ? t = this._scriptContentToJSON() : "stroke" === this.settingsFormat && (t = e.innerHTML.trim()), t) {
            if (this.settings = this.prepareAndFilterData(t), this._assign(this.settings, this.utmInfo), !this._isValidSettings()) return void this._doEmergencyReplacement("Settings is not valid");
            this.iframe = this._createDummyIframe(), this._addIndividualAttributes(this.iframe), this.iframeWrap = this._createIframeWrap(this.settings.whitelabel), this._doReplacement()
        }
    }, f.prototype._assign = function(e, t) {
        for (var r in t) e[r] = t[r]
    }, f.prototype._isValidSettings = function() {
        var e = function(e) {
            if (void 0 === e) return !0;
            var t = parseInt(e) + "%" == e + "";
            return parseInt(e) + "" == e + "" || t
        };
        return e(this.settings.width) && e(this.settings.height)
    }, f.prototype._addIndividualAttributes = function(e) {
        var t = this.iframeSrcBase;
        t += this._buildGetQueryString(), t += this._buildHashString(), e.setAttribute("src", t)
    }, f.prototype._buildGetQueryString = function() {
        var e = this,
            t = this.propertiesToGetParams.filter(function(t) {
                return e.settings[t]
            }).map(function(t) {
                return t + "=" + e.settings[t]
            }).join("&");
        return t ? "?" + t : ""
    }, f.prototype._buildHashString = function() {
        var e = this,
            t = {};
        return Object.keys(this.settings).forEach(function(r) {
            -1 === e.propertiesToSkipInHash.indexOf(r) && (t[r] = e.settings[r])
        }), Object.keys(t).length > 0 ? "#" + encodeURIComponent(JSON.stringify(t)) : ""
    }, f.prototype._scriptContentToJSON = function() {
        var e = this.script.innerHTML.trim();
        try {
            var t = JSON.parse(e)
        } catch (e) {
            return this._doEmergencyReplacement(), console.log("Error while parsing hotlists embed widget settings: ", e), !1
        }
        return t
    }, f.prototype._createDummyIframe = function() {
        var e = document.createElement("iframe");
        return this.settings.enableScrolling || e.setAttribute("scrolling", "no"), e.setAttribute("allowtransparency", !0), e.setAttribute("frameborder", 0), e.style.boxSizing = "border-box", this.settings.width && e.setAttribute("width", this.settings.width), this.settings.height && e.setAttribute("height", this.settings.height), e
    }, f.prototype._createIframeWrap = function(e) {
        var t = document.createElement("div");
        return t.style.width = isNaN(this.settings.width) ? this.settings.width : this.settings.width + "px", t.style.height = isNaN(this.settings.height) ? this.settings.height : this.settings.height + "px", t.style.position = "relative", e || this._appendCopyrightTo(t), this.hasOutsideHeader && this._appendOutsideHeaderTo(t), t
    }, f.prototype._appendCopyrightTo = function(e) {
        var t = this;
        this.copyright = document.createElement("span");
        var r = Object.keys(this.utmInfo).map(function(e) {
                return e + "=" + t.utmInfo[e]
            }).join("&"),
            o = this.getCopyrightText(this.settings.locale, {
                utmString: r
            });
        this.copyright.innerHTML = o, this._makeNodeStylish(this.copyright, {
            display: "block",
            position: "absolute",
            bottom: "0",
            left: "0",
            width: "100%",
            padding: "8px 0",
            textAlign: "center",
            boxSizing: "content-box",
            height: "16px",
            lineHeight: "16px"
        }), e.appendChild(this.copyright)
    }, f.prototype._appendOutsideHeaderTo = function(e) {
        this.outsideIframeHeader = void 0
    }, f.prototype._makeNodeStylish = function(e, t) {
        void 0 === t && (t = {});
        for (var r in t) e.style[r] = t[r]
    }, f.prototype.getCopyrightText = function(e, r) {
        void 0 === e && (e = "en"), void 0 === r && (r = {});
        var o = a[e] || e;
        return r.locale = a[e] ? e : "en", r.widgetName = this.widgetName, t(o, r)
    }, f.prototype._doReplacement = function() {
        if (this.script.parentNode.replaceChild(this.iframeWrap, this.script), this.copyright) {
            var e = this._getCopyrightHeight();
            this.iframe.style.paddingBottom = e + "px", this.iframeWrap.insertBefore(this.iframe, this.copyright)
        } else this.iframeWrap.appendChild(this.iframe);
        if (this.outsideIframeHeader) {
            var t = this.outsideIframeHeader.offsetHeight;
            this.iframe.style.paddingTop = t + "px"
        }
        this._removeSEOcopyright()
    }, f.prototype._getCopyrightHeight = function() {
        return this.iframeWrap && this.copyright ? this.copyright.offsetHeight : 0
    }, f.prototype._doEmergencyReplacement = function(e) {
        var t = document.createElement("div");
        t.innerHTML = e || "Something gone wrong", this.script.parentNode.replaceChild(t, this.script), this._removeSEOcopyright()
    }, f.prototype._removeSEOcopyright = function() {
        var e = document.getElementById("tradingview-copyright") || document.getElementById("tradingview-quotes");
        e && e.parentNode.removeChild(e)
    }, Object.defineProperties(f.prototype, k);
    var v = new Image;
    v.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAMAAAApB0NrAAACi1BMVEVHcEwGllYALY8RtTDPQ1n6/fsAMI95eW5nVUYApGYyqlEAMJMALZIJk2C8Fjb1xshsWzoFq0vbBibOECkWsTLODSfWMjfcPE9AJnDOECkAnli7ucy5uNS5uNO5uNMBk0oBlEmercsBk0oam1rfBx8WsTLaBijOECnbByVCZaz///////9CZaz///9CJm8AmmJqsuZUsrhqsuZusu5qsuZmr2QnjiSXshz/0QZ0tNbyzhr/1AgkjzBuH1nmh5T////LARtxHVnnyx44dUMPLokAMZIAI4v2lJpEcLb////8+/4AJosAMZPSDibOECnVDCcAK5X87vDRCScHryb79PXt8/kBSn1nserbByRBZKsWsTI1JHNRbaJoteraKyHskpXNCiSXshtqsuYBlUgAmmL/1Qe/Ei90tNZjr+bLABsAIokSsStusu7VNknLABT76+1yYS0AMJD/0QaxJirMBh96ueeP2JyIw9bzuLozwFFxptlwstZDJW7FFTf/3AbOBibLCSpQXlMAGoIAm0iqFDq/EicnRHMAKo/RITiCptZlr2TeKT10tda+AxXmh5RUsrgjjzAJuzLBKi33lJoAL5BEcLb4xcv8yMvaBigPLYknjSQARYLyzxnaTWAitThOr7W11/DQ5fTpkZycyuuizezI68/gHRZNwmLrdX5yqdh0z4PX8NpereneW2zZSl1zsdd5z4vF4PfmoCHVITfR0tWu88ZoXiXfGjfznQ7HJT7gwSCliCAclTCBhlUglCT6oRBTbSaUuRxQbi9zWU1jJ1kER32sbVk0THbavAjrxQ8gOYHdAiaflDcSP5gOO4n1yBC5uNNoTokAS4IEL4CVsSmDp8hTfLwzkDhxsWueh8LIAAAASXRSTlMAhPHwFvZABf79FybP/Pf8Qifw0IJ89Ih86UGFud/x37lC8PSH0D8oJ0In0PZ89dHxRd+JuPaHRbjx34noh4VCuOdD5+C4hed72JdIZwAAAkFJREFUeF5tz4NzJEEUBvC3yW76bmPnYp5tWzNrK7ZtO0fbtm3bxp9zPTs9SvKbqp43VV/19wZEkJcsPi4xJzEuXhaJYDjyRcte5fTksHpWJMthMBQxubXV9dpqPYgf64/+GrtfBAIJbx81Q6/Xv/3Uj0+XXdNb5eMNIl4eVYxdKlV317uubtWAS6frVak8vIZG1A6HIzU1FZ/fNRo//Jo4ji/CEcbAZwtF7KmtLaMwxXiyro+KVazmM/44QzPDBHbxtbs5f2jpPYxJgMn993L8/20gHhuNO9hplhIAkst5mw8QT57pdDVkng2A1uzkZfzdxnr0AmfIvBBBwnrB719ZrOcPcVcWMQdWFwt+fs1jtT/t7EyvJh8LYJWap//yPq/arf1eR0d6NTEXVu4XfHhwiLjR1hbGzfPBL19w/1ZDS0sBtulqc/P5AmIeaATGmwb6euklGyMtLc3GgVFaXuY6A0VZTmUXZktMHZKhaMvJQklqOiwt4pVrKyi343Xi1ExYvEVwwoyvaaRx4bE6WylnBiyhJMznzmTQTGPD0a3ENEAKaSgjvRGfivojJYQnAgg/zLlyGXdVGAwUXd9kKnESIQAgz6wlivDOTM/pszjB8VQCFir994sXnCanIAQYKFiUUVwjCSIFgdvYIDvrrvl2k2m7mGcgEAEjWC/fVN6plAgAXuRIt9y+j/vEgkaDSOCUXMw3X6MVCR4DEkjmizN9xkyeNhTBYEpZUlLZRk5YuByGg5ZHRcfEfouNiY5KAJH/0kmHLARRQ6cAAAAASUVORK5CYII=";
    var _ = {
        economictimes: {
            renderCopyright: function(e) {
                var t = document.createElement("span");
                return t.innerHTML = 'Quotes by\n\t\t\t\t<a href="http://in.tradingview.com' + (e ? "?" + e : "") + '" rel="nofollow" target="_blank"\n\t\t\t\t\tstyle="color: #3BB3E4">\n\t\t\t\t\tTradingView\n\t\t\t\t</a>', t
            },
            copyrightStyles: {
                display: "block",
                position: "absolute",
                bottom: "0",
                left: "0",
                width: "100%",
                padding: "8px 0",
                textAlign: "left",
                fontFamily: "'Trebuchet MS', Tahoma, Arial, sans-serif",
                fontSize: "13px",
                color: "#ADAEB0",
                lineHeight: "normal",
                boxSizing: "content-box",
                backgroundColor: "#EEEEEE",
                textIndent: "10px"
            },
            renderOutsideHeader: function() {
                var e = document.createElement("div");
                v.style.float = "left", v.style.margin = "0 10px", e.appendChild(v);
                var t = document.createElement("span");
                t.innerHTML = "Global Indices", t.style.float = "left", t.style.margin = "8px 0", e.appendChild(t);
                var r = document.createElement("span");
                return r.innerHTML = "*End of Day", r.style.float = "right", r.style.margin = "20px 10px 0 0", r.style.fontSize = "11px", r.style.fontWeight = "normal", r.style.color = "#B4B4B4", e.appendChild(r), e
            },
            outsideHeaderStyles: {
                display: "block",
                position: "absolute",
                left: 0,
                top: 0,
                padding: "8px 0",
                color: "#000",
                fontFamily: "'Trebuchet MS', Tahoma, Arial, sans-serif",
                fontWeight: "bold",
                fontSize: "16px",
                textAlign: "left",
                lineHeight: "normal",
                boxSizing: "content-box",
                backgroundColor: "#EEEEEE",
                width: "100%"
            }
        }
    };
    new(function(e) {
        function t() {
            e.apply(this, arguments)
        }
        e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t;
        var r = {
            embedWidgetSitePath: {},
            widgetName: {},
            propertiesToWorkWith: {},
            customerSettings: {},
            hasOutsideHeader: {},
            hasCustomCopyright: {},
            propertiesToSkipInHash: {},
            propertiesToGetParams: {}
        };
        return r.embedWidgetSitePath.get = function() {
            return "/marketoverviewwidgetembed/"
        }, r.widgetName.get = function() {
            return "marketoverview"
        }, r.propertiesToWorkWith.get = function() {
            return ["tabs", "customer", "showChart", "largeChartUrl", "gridLineColor", "scaleFontColor", "plotLineColorGrowing", "plotLineColorFalling", "belowLineFillColorGrowing", "belowLineFillColorFalling", "symbolActiveColor", "indexNameBold", "valueBold", "indexNonClickable", "arrowOnValue", "valueTitleMarked", "locale", "width", "height", "whitelabel"]
        }, r.customerSettings.get = function() {
            return this.settings.customer && this.settings.customer in _ && _[this.settings.customer]
        }, r.hasOutsideHeader.get = function() {
            return this.customerSettings && this.customerSettings.renderOutsideHeader
        }, r.hasCustomCopyright.get = function() {
            return this.customerSettings && this.customerSettings.renderCopyright
        }, t.prototype._appendCopyrightTo = function(t) {
            var r = this;
            if (this.hasCustomCopyright) {
                var o = Object.keys(this.utmInfo).map(function(e) {
                    return e + "=" + r.utmInfo[e]
                }).join("&");
                this.copyright = this.customerSettings.renderCopyright(o), this._makeNodeStylish(this.copyright, this.customerSettings.copyrightStyles || {}), t.appendChild(this.copyright)
            } else e.prototype._appendCopyrightTo.call(this, t)
        }, t.prototype._appendOutsideHeaderTo = function(e) {
            this.outsideIframeHeader = this.customerSettings.renderOutsideHeader(), this._makeNodeStylish(this.outsideIframeHeader, this.customerSettings.outsideHeaderStyles || {}), e.appendChild(this.outsideIframeHeader)
        }, t.prototype._createIframeWrap = function() {
            return e.prototype._createIframeWrap.call(this, this.settings.whitelabel)
        }, r.propertiesToSkipInHash.get = function() {
            return ["customer"]
        }, r.propertiesToGetParams.get = function() {
            return ["whitelabel"]
        }, Object.defineProperties(t.prototype, r), t
    }(f))(i.widgets.marketoverview)
}();
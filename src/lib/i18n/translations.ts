import type { ProductId } from "@/lib/product";

export type Locale = "sv" | "en";

export const translations = {
  sv: {
    brand: "SimpliCity",
    nav: {
      products: "Produkter",
      labTests: "Labbtester",
      features: "Fördelar",
      quality: "Kvalitet",
      order: "Beställ",
      blog: "Blogg",
      contact: "Kontakt",
      calculator: "Kalkylator",
      buyNow: "Köp nu",
    },
    hero: {
      badge: "SUPPORT 24/7",
      intake: "Premiumingredienser för forskning",
      headline: "Kvalitet utan kompromisser",
      tagline: "Renhet och kvalitet i fokus",
      subtitle:
        "SimpliCity är byggt för kunder som förväntar sig mer — noggrant utvalda peptider, verifierad renhet och en premiumupplevelse utan kompromisser.",
      ctaPrimary: "Utforska sortiment",
      ctaCampaign: "Till erbjudandet",
      ctaSecondary: "Se fördelar",
      stats: {
        purity: { label: "Renhet", value: "100%" },
        shipping: { label: "Leverans", value: "24h" },
        support: { label: "Support", value: "24/7" },
      },
      featuredLabel: "Utvald produkt",
      imagePlaceholder: "Produktbild",
    },
    products: {
      eyebrow: "Vår kollektion",
      title: "Välj din produkt",
      subtitle:
        "Bläddra i vår kollektion och lägg till produkter i varukorgen. Kassan uppdateras direkt.",
      oneTime: "Engångsköp",
      addToCart: "Lägg i varukorg",
      inStock: "I lager",
      outOfStock: "Ej i lager",
      comingSoon: "Kommer snart",
      soldOut: "Slutsåld",
      comingSoonButton: "Kommer snart",
      stockLow: "🔥 Endast {{count}} kvar i lager!",
      stockAvailable: "📦 {{count}} kvar i lager — Skickas idag!",
      stockStatus: {
        i_lager: "I lager",
        ej_i_lager: "Ej i lager",
        kommer_snart: "Kommer snart",
      },
      variantLabel: "Styrka",
      badges: {
        popular: "Bästsäljare",
        premium: "Premium",
      },
      items: {
        "melo-spray": {
          name: "Melanotan 2 (Nasal Spray)",
          description:
            "Premium Melanotan 2 i praktisk nässpray — snabb absorption och enkel dosering.",
        },
        "melanotan-vial": {
          name: "Melanotan 2 (Vial)",
          description:
            "Melanotan 2 i injicerbar form — hög renhet och noggrant testad kvalitet.",
        },
        retatrutide: {
          name: "Retatrutid",
          description:
            "Avancerad peptidformel med flera styrkor — välj den dos som passar ditt protokoll.",
        },
        tirzepatide: {
          name: "Tirzepatid",
          description:
            "Vår mest efterfrågade peptid med flexibla mg-alternativ — från 5 mg till 30 mg.",
        },
      } satisfies Record<ProductId, { name: string; description: string }>,
    },
    features: {
      eyebrow: "Varför SimpliCity",
      title: "Skapat för dig som kräver mer",
      subtitle:
        "Vi gör det enkelt och tryggt att investera i premium wellness — med transparens och kvalitet du kan lita på.",
      items: [
        {
          title: "Certifierade ingredienser",
          description:
            "Varje formel bygger på noggrant utvalda, spårbara råvaror med full transparens.",
        },
        {
          title: "Skickas inom 24 timmar",
          description:
            "De flesta beställningar skickas samma dag. Fri frakt vid större beställningar.",
        },
        {
          title: "Skandinavisk kvalitet",
          description:
            "Utvecklad med skandinavisk precision och testad enligt strikta kvalitetsstandarder.",
        },
        {
          title: "Säker checkout",
          description:
            "Dina uppgifter hanteras med omsorg. Enkel, snabb och trygg beställning.",
        },
        {
          title: "Riktig support",
          description:
            "Frågor? Vi svarar inom 24 timmar — inga chatbotar, bara riktiga människor.",
        },
        {
          title: "Full spårbarhet",
          description:
            "Följ varje produkt från tillverkning till leverans. Total transparens.",
        },
      ],
    },
    quality: {
      eyebrow: "Garanterad kvalitet",
      title: "Inga kompromisser — från labb till dig",
      description:
        "Varje SimpliCity-produkt genomgår rigorös kvalitetskontroll. Från råmaterial till färdig produkt hanteras varje steg med precision och omsorg.",
      checklist: [
        "Oberoende kvalitetsanalys för varje batch",
        "Verifierade ingredienser och renhetsgaranti",
        "Publicerade resultat — se själv vad du får",
        "Premiumförpackning för maximal hållbarhet",
      ],
    },
    cart: {
      title: "Din varukorg",
      empty: "Din varukorg är tom.",
      subtotal: "Delsumma",
      checkout: "Gå till kassan",
      close: "Stäng varukorg",
      openCart: "Öppna varukorg",
      itemSingular: "artikel",
      itemPlural: "artiklar",
      maxStockReached: "Maximalt tillgängligt antal i lager uppnått",
    },
    order: {
      eyebrow: "Beställ nu",
      title: "Slutför din beställning",
      subtitle:
        "Fyll i dina uppgifter nedan. Varukorgen och ordersammanfattningen uppdateras automatiskt.",
      addMore: "Lägg till fler",
      emptyCart: "Din varukorg är tom. Lägg till produkter ovan.",
      name: "Fullständigt namn",
      email: "E-postadress",
      address: "Leveransadress",
      city: "Stad",
      state: "Län",
      zip: "Postnummer",
      quantity: "Antal",
      decreaseQty: "Minska antal",
      increaseQty: "Öka antal",
      placeOrder: "Lägg beställning",
      processing: "Bearbetar beställning...",
      summary: "Ordersammanfattning",
      subtotal: "Delsumma",
      shipping: "Frakt",
      total: "Totalt",
      free: "Gratis",
      freeShippingHint: "Handla för {amount} kr till för fri frakt",
      secureNote: "Säker testcheckout — ingen betalning debiteras",
      shipsNote: "Skickas inom 24 timmar",
      discount: {
        label: "Rabattkod",
        placeholder: "Ange kod",
        apply: "Tillämpa",
        applied: "Kod tillämpad!",
        invalid: "Ogiltig kod",
        expired: "Koden har nått sin användningsgräns",
        productMismatch: "Koden gäller inte produkterna i din varukorg",
        lineLabel: "Rabatt",
      },
      errors: {
        generic: "Något gick fel. Försök igen.",
        failed: "Beställningen misslyckades. Försök igen.",
        emptyCart: "Lägg till minst en produkt i varukorgen innan du beställer.",
      },
      placeholders: {
        name: "Anna Andersson",
        email: "anna@exempel.se",
        address: "Storgatan 12, lgh 4",
        city: "Stockholm",
        state: "Stockholm",
        zip: "111 22",
      },
      continueToPayment: "Fortsätt till betalning",
    },
    checkoutMethod: {
      eyebrow: "Betalning",
      title: "Välj betalsätt",
      subtitle:
        "Betala direkt med kort, Klarna eller Link — eller skicka Bitcoin manuellt.",
      backToDetails: "← Tillbaka till leveransuppgifter",
      continue: "Fortsätt →",
      stripe: {
        title: "Betala med kort / Klarna",
        subtitle: "Automatisk betalning via Stripe",
        badge: "Automatisk",
        note: "Bekräftas direkt efter betalning. Klarna, kort och Link stöds.",
        eyebrow: "Stripe Checkout",
        description:
          "Du skickas vidare till Stripe för säker betalning. Ordern markeras som betald automatiskt.",
        orderTotal: "Att betala",
        secureNote: "Säker betalning via Stripe. Leveransadress samlas in för Sverige.",
        checkoutButton: "Gå till säker betalning →",
        processing: "Förbereder betalning...",
        backToMethod: "← Tillbaka till betalsätt",
        errors: {
          submitFailed: "Kunde inte starta Stripe-betalningen. Försök igen.",
        },
      },
      bitcoin: {
        title: "Betala med Bitcoin",
        subtitle: "Manuell BTC-betalning",
        badge: "Manuell",
        note: "Generera en BTC-adress och skicka betalningen. Vi godkänner manuellt efter verifiering.",
      },
    },
    payment: {
      eyebrow: "Bitcoin-betalning",
      title: "Slutför din BTC-betalning",
      subtitle:
        "Granska livekursen och generera din unika Bitcoin-betalningsadress.",
      backToDetails: "← Tillbaka till leveransuppgifter",
      backToMethod: "← Tillbaka till betalsätt",
      walletWarning:
        "Skicka endast Bitcoin (BTC) till adressen nedan. Skicka från en personlig plånbok eller Revolut.",
      exchangeBoard: {
        title: "Växlingskurs",
        liveBadge: "LIVEKURS",
        orderTotal: "Ordersumma",
        youSend: "Du skickar",
        lockedRate: "Kurs låst i",
        refreshNote: "Uppdateras ungefär var 15:e minut",
        fallbackNote: "Reservkurs används — live-API otillgängligt",
        sek: "SEK",
        usd: "USD",
      },
      generateAddress: "Generera betalningsadress →",
      generating: "Genererar adress...",
      paymentReady: "Betalningsadress klar",
      sendExactly: "Skicka exakt",
      toAddress: "Till adress",
      copyAddress: "Kopiera adress",
      copied: "Kopierad!",
      openWallet: "👉 Öppna i plånbok",
      qrLabel: "Skanna QR-kod",
      qrUnavailable: "QR-kod ej tillgänglig",
      confirmationNote:
        "Din order behandlas så snart transaktionen får blockchain-bekräftelser.",
      viewReceipt: "Visa orderkvitto →",
      errors: {
        selectNetwork: "Välj ett nätverk för att fortsätta.",
        submitFailed: "Kunde inte slutföra beställningen. Försök igen.",
        walletNotConfigured:
          "Betalningsadress saknas. Kontakta butiken eller försök igen senare.",
      },
    },
    success: {
      backToStore: "← Tillbaka till butiken",
      confirmed: "Order mottagen",
      title: "Order Mottagen - Väntar på betalningsbekräftelse",
      subtitle:
        "Din beställning har registrerats. För att slutföra ditt köp måste din kryptotransaktion verifieras på blockchain-nätverket. Vi förbereder din leverans så snart din betalning har godkänts manuellt av oss (vanligtvis inom 10-30 minuter).",
      pendingStatus: "🔴 Status: Väntar på betalning",
      paidStatus: "🟢 Status: Betalning bekräftad",
      stripeTitle: "Tack för din beställning!",
      stripeSubtitle:
        "Din Stripe-betalning har bekräftats. Vi förbereder din leverans och skickar en bekräftelse till din e-post.",
      bitcoinTitle: "Order Mottagen - Väntar på betalningsbekräftelse",
      bitcoinSubtitle:
        "Din beställning har registrerats. För att slutföra ditt köp måste din Bitcoin-transaktion verifieras. Vi förbereder din leverans så snart din betalning har godkänts manuellt av oss (vanligtvis inom 10-30 minuter).",
      receipt: "Kvitto",
      justNow: "Just nu",
      customer: "Kund",
      shippingTo: "Levereras till",
      item: "Artikel",
      qty: "Antal",
      amount: "Belopp",
      subtotal: "Delsumma",
      shipping: "Frakt",
      totalPaid: "Totalt att betala",
      discount: "Rabatt",
      free: "Gratis",
      noOrder: "Ingen orderinformation hittades. Du kan ha kommit hit direkt.",
      placeNew: "Lägg en ny beställning →",
      emailConfirm: "En orderbekräftelse skickas till",
      delivery:
        "Leverans påbörjas efter att vi manuellt verifierat din kryptobetalning.",
      continue: "Fortsätt handla",
    },
    footer: {
      rights: "Alla rättigheter förbehållna.",
      privacy: "Integritetspolicy",
      terms: "Villkor",
      disclaimerLink: "Ansvarsfriskrivning",
      labTests: "Labbtest",
    },
    legal: {
      lastUpdated: "Senast uppdaterad",
      disclaimerLastUpdated: "17 juni 2026",
      disclaimer: {
        title: "Ansvarsfriskrivning",
        subtitle:
          "Forskningsprodukter och kemiska föreningar — uteslutande avsedda för laboratorieforskning, in vitro-diagnostik och vetenskaplig utvärdering. Ej för konsumtion.",
        sections: [
          {
            heading: "1. Användningsområde — Endast för forskning",
            body: "Alla kemiska produkter, peptider och relaterade substanser som säljs via SimpliCity (\"Produkterna\") är uteslutande avsedda för in vitro-forskning, laboratoriebruk, in vitro-diagnostisk testning och vetenskapliga utvärderingsändamål. Produkterna är inte avsedda, godkända eller marknadsförda för humant eller veterinärt bruk, inklusive men inte begränsat till diagnostik, terapeutisk behandling, konsumtion, injektion eller någon annan form av administrering till människor eller djur.",
          },
          {
            heading: "2. Köpvillkor och bekräftelse",
            body: "Genom att genomföra ett köp på SimpliCity bekräftar och garanterar köparen att:\n\n• Köparen är minst 18 år gammal och har rättslig handlingsförmåga att ingå avtal.\n• Produkterna uteslutande kommer att användas för legitim forskning, laboratorieverksamhet och vetenskaplig utvärdering.\n• Köparen inte avser att använda Produkterna för personligt bruk, konsumtion eller administrering till sig själv, annan person eller djur.\n• Köparen har nödvändig kompetens, utrustning och, i förekommande fall, tillstånd för att hantera de beställda substanserna i enlighet med gällande lagar och förordningar.\n• Köparen ansvarar för att säkerställa att köp, innehav och användning av Produkterna är förenligt med alla tillämpliga lagar och regler i köparens jurisdiktion.",
          },
          {
            heading: "3. Förbjuden användning",
            body: "Det är uttryckligen förbjudet att använda Produkterna för något av följande:\n\n• Humant eller veterinärt bruk i någon form, inklusive men inte begränsat till oral, intravenös, subkutan, intramuskulär eller topikal administrering.\n• Användning som livsmedel, kosttillskott, läkemedel, medicinteknisk produkt eller kosmetika.\n• Direkt mänsklig konsumtion i någon form.\n• Vidareförsäljning med marknadsföring som antyder att Produkterna är avsedda för mänsklig eller animalisk konsumtion.\n• All annan användning som strider mot tillämplig lagstiftning, inklusive Läkemedelsverkets föreskrifter och EU-förordningar.",
          },
          {
            heading: "4. Ansvarsbegränsning",
            body: "SimpliCity (\"Företaget\") frånsäger sig allt ansvar för skador, förluster, sjukdomar, biverkningar eller andra negativa konsekvenser som direkt eller indirekt uppstår till följd av felaktig användning, hantering eller förvaring av Produkterna, inklusive men inte begränsat till användning i strid med denna ansvarsfriskrivning.\n\nFöretaget lämnar inga garantier, uttryckliga eller underförstådda, avseende Produkternas lämplighet för något specifikt ändamål utöver in vitro-forskning och vetenskaplig utvärdering. Företaget ansvarar inte för eventuella hälsorisker, allergiska reaktioner eller skador som uppkommer vid användning som inte överensstämmer med den avsedda forskningsanvändningen.",
          },
          {
            heading: "5. Hävningsrätt",
            body: "Företaget förbehåller sig rätten att neka, annullera eller häva beställningar om det finns skälig anledning att anta att Produkterna avses användas i strid med denna ansvarsfriskrivning, tillämpliga lagar eller på ett sätt som kan medföra skada. I sådana fall återbetalas eventuellt erlagt belopp med avdrag för redan uppkomna kostnader.",
          },
          {
            heading: "6. Skadeståndsskyldighet och skadeslöshet",
            body: "Köparen åtar sig att hålla Företaget, dess ägare, anställda och samarbetspartners skadeslösa från alla krav, stämningar, skadestånd, böter, kostnader (inklusive rimliga advokatkostnader) och andra förluster som uppstår till följd av köparens användning av Produkterna i strid med denna ansvarsfriskrivning eller tillämplig lag.",
          },
          {
            heading: "7. Regulatorisk information",
            body: "Produkterna har inte utvärderats, godkänts eller registrerats av Läkemedelsverket, Europeiska läkemedelsmyndigheten (EMA), U.S. Food and Drug Administration (FDA) eller motsvarande regulatorisk myndighet i någon jurisdiktion. Ingenting på denna webbplats ska tolkas som medicinsk rådgivning, diagnostik eller behandlingsrekommendation.",
          },
          {
            heading: "8. Märkning och hantering",
            body: "Alla Produkter är märkta med texten \"Endast för forskningsändamål — Ej för mänsklig konsumtion\" eller motsvarande formulering. Köparen är skyldig att bibehålla denna märkning och förvara Produkterna på ett säkert sätt, utom räckhåll för obehöriga personer.",
          },
          {
            heading: "9. Tillämplig lag",
            body: "Denna ansvarsfriskrivning regleras av och tolkas i enlighet med svensk lag, utan hänsyn till lagvalsregler. Eventuella tvister som uppstår i samband med denna ansvarsfriskrivning ska i första hand avgöras genom förhandling och, om överenskommelse inte kan nås, hänskjutas till behörig domstol i Sverige.",
          },
          {
            heading: "10. Kontakt",
            body: "Frågor om denna ansvarsfriskrivning? Använd kontaktformuläret på startsidan eller nå oss via de kanaler som anges där.",
          },
        ],
      },
      privacy: {
        title: "Integritetspolicy",
        subtitle:
          "Hur SimpliCity samlar in, använder och skyddar dina personuppgifter.",
        sections: [
          {
            heading: "1. Introduktion",
            body: "SimpliCity värnar om din integritet. Denna policy beskriver vilka uppgifter vi samlar in när du besöker vår webbplats, lägger en beställning eller kontaktar oss — och hur vi hanterar dem i enlighet med GDPR.",
          },
          {
            heading: "2. Uppgifter vi samlar in",
            body: "Vi kan behandla namn, e-postadress, leveransadress, orderhistorik och meddelanden du skickar via kontaktformuläret. Teknisk data som IP-adress och webbläsartyp kan loggas för säkerhet och drift.",
          },
          {
            heading: "3. Hur vi använder uppgifterna",
            body: "Uppgifterna används för att behandla beställningar, leverera produkter, ge kundsupport och förbättra vår tjänst. Vi säljer inte dina personuppgifter till tredje part.",
          },
          {
            heading: "4. Lagring och säkerhet",
            body: "Data lagras så länge det krävs för att uppfylla avtal eller lagkrav. Vi vidtar rimliga tekniska och organisatoriska åtgärder för att skydda dina uppgifter mot obehörig åtkomst.",
          },
          {
            heading: "5. Dina rättigheter",
            body: "Du har rätt att begära tillgång till, rättelse eller radering av dina uppgifter, samt att invända mot viss behandling. Kontakta oss via kontaktformuläret för att utöva dina rättigheter.",
          },
          {
            heading: "6. Kontakt",
            body: "Frågor om denna policy? Använd kontaktformuläret på startsidan eller nå oss via de kanaler som anges där.",
          },
        ],
      },
      terms: {
        title: "Villkor",
        subtitle:
          "Användarvillkor och riktlinjer för forskning och personligt bruk.",
        sections: [
          {
            heading: "1. Godkännande av villkor",
            body: "Genom att använda SimpliCity godkänner du dessa villkor. Om du inte accepterar dem ska du inte använda webbplatsen eller lägga beställningar.",
          },
          {
            heading: "2. Produkter och användning",
            body: "Våra produkter säljs uteslutande för personligt bruk och forskningsändamål. De är inte avsedda att diagnostisera, behandla, bota eller förebygga sjukdom. Du ansvarar själv för att användningen följer gällande lagar i ditt land.",
          },
          {
            heading: "3. Beställningar och betalning",
            body: "Alla beställningar är föremål för tillgänglighet och bekräftelse. Betalning sker enligt de instruktioner som ges vid checkout. Vi förbehåller oss rätten att avbryta beställningar vid misstanke om bedrägeri eller brott mot dessa villkor.",
          },
          {
            heading: "4. Leverans",
            body: "Leveranstider är uppskattningar och kan variera. Risken för varan övergår till dig vid leverans enligt våra fraktvillkor. Du ansvarar för att ange korrekt leveransadress.",
          },
          {
            heading: "5. Forskningsriktlinjer",
            body: "Kunder som använder produkter i forskningssammanhang ska följa god laboratoriepraxis, dokumentera protokoll noggrant och aldrig dela eller sälja vidare produkter till obehöriga.",
          },
          {
            heading: "6. Ansvarsbegränsning",
            body: "SimpliCity ansvarar inte för indirekta skador eller följdskador som uppstår från produktanvändning. Vårt ansvar är i den utsträckning lagen tillåter begränsat till det belopp du betalat för den aktuella beställningen.",
          },
          {
            heading: "7. Ändringar",
            body: "Vi kan uppdatera dessa villkor. Fortsatt användning efter publicerade ändringar innebär att du accepterar de nya villkoren.",
          },
        ],
      },
      labTests: {
        title: "Labbtest",
        subtitle:
          "Så verifierar vi varje batch — transparens från produktion till leverans.",
        sections: [
          {
            heading: "Oberoende batchanalys",
            body: "Varje produktionsbatch genomgår oberoende kvalitetsanalys innan den släpps till försäljning. Vi testar renhet, identitet och koncentration mot etablerade referensstandarder.",
          },
          {
            heading: "Vad vi mäter",
            body: "Typiska analysparametrar inkluderar HPLC-renhet, endotoxinscreening där tillämpligt, och visuell samt funktionell kontroll av förpackning. Resultat arkiveras per batchnummer.",
          },
          {
            heading: "Publicerade resultat",
            body: "Sammanfattade testresultat publiceras löpande på denna sida. Fullständiga COA-dokument (Certificate of Analysis) kan begäras via kontaktformuläret med ditt order- eller batchnummer.",
          },
          {
            heading: "Kommande rapporter",
            body: "Vi bygger ut denna sektion med detaljerade batchrapporter. Tills dess kan du kontakta oss för aktuella testresultat för produkter i lager.",
          },
        ],
        placeholder: {
          title: "Batchrapporter kommer snart",
          body: "En interaktiv lista över verifierade batcher och nedladdningsbara COA-filer läggs till här. Under tiden — fråga oss direkt så delar vi relevant dokumentation.",
        },
      },
    },
    errors: {
      notFound: {
        title: "Sidan kunde inte hittas",
        titleEn: "Page not found",
        description:
          "Länken kan vara felaktig eller sidan har flyttats. Gå tillbaka till startsidan och fortsätt handla.",
        backHome: "Tillbaka till startsidan",
      },
      global: {
        title: "Något gick fel",
        titleEn: "Something went wrong",
        description:
          "Ett oväntat fel inträffade. Försök igen eller gå tillbaka till startsidan.",
        tryAgain: "Försök igen",
        backHome: "Tillbaka till startsidan",
      },
    },
    trust: {
      shipping: {
        title: "Snabb leverans",
        description: "Skickas inom 1–3 arbetsdagar i hela Sverige",
      },
      support: {
        title: "Support inom 24h",
        description: "Snabb återkoppling via e-post",
      },
      payment: {
        title: "Säker betalning",
        description: "Kort, Klarna, Link eller Bitcoin",
      },
      quality: {
        title: "Premium kvalitet",
        description: "Noggrant testade produkter av högsta klass",
      },
      securePayments: "🔒 Säkra och diskreta betalningar",
      shipWith: "Vi skickar med",
    },
    reviews: {
      eyebrow: "Kundrecensioner",
      title: "Kundrecensioner",
      averageLabel: "Genomsnitt",
      reviewCount: "{{count}} recensioner",
      verifiedPurchase: "Verifierat köp",
      writeReview: "Skriv en recension",
      cancel: "Avbryt",
      submit: "Skicka recension",
      noReviews: "Inga recensioner ännu — bli den första att dela din upplevelse.",
      loading: "Laddar recensioner…",
      adminReplyLabel: "Svar från SimpliCity",
      form: {
        nameLabel: "Namn",
        namePlaceholder: "Ditt namn",
        ratingLabel: "Betyg",
        textLabel: "Din recension",
        textPlaceholder: "Berätta om din upplevelse…",
        emailLabel:
          "Din e-postadress (Valfritt - om du vill ha svar på din recension)",
        emailPlaceholder: "namn@email.com",
        nameRequired: "Ange ditt namn (minst 2 tecken).",
        textRequired: "Skriv minst 10 tecken i din recension.",
        ratingRequired: "Välj ett betyg mellan 1 och 5 stjärnor.",
        productLabel: "Vilken produkt köpte du?",
        productPlaceholder: "Välj produkt",
        productRequired: "Välj vilken produkt du köpte.",
        emailInvalid: "Ange en giltig e-postadress eller lämna fältet tomt.",
        success:
          "Tack! Din recension har skickats och kommer att visas efter granskning.",
        error: "Kunde inte skicka recensionen. Försök igen.",
      },
    },
    faq: {
      eyebrow: "Vanliga frågor",
      title: "Frågor & svar",
      widgetTitle: "Supportassistent",
      helperLabel: "Öppna support och vanliga frågor",
      teacherTag: "Vanliga frågor",
      close: "Stäng",
      subtitle:
        "Här hittar du svar på de vanligaste frågorna om beställning, leverans och produkter.",
      feedbackPrompt: "Var denna guide till hjälp?",
      feedbackPositive: "Bra guide",
      feedbackNegative: "Inte till hjälp",
      feedbackThanksPositive: "Tack för din feedback!",
      feedbackThanksNegative: "Tack — vi förbättrar guiden.",
    },
    contact: {
      eyebrow: "Kontakta oss",
      title: "Vi finns här för dig",
      subtitle:
        "Har du frågor om din beställning eller våra produkter? Skicka ett meddelande eller nå oss direkt.",
      name: "Namn",
      email: "E-post",
      message: "Meddelande",
      send: "Skicka meddelande",
      sending: "Skickar...",
      success: "Tack! Vi återkommer inom 24 timmar.",
      directTitle: "Eller kontakta oss direkt",
      telegram: "Telegram",
      emailLink: "E-post",
      placeholders: {
        name: "Anna Andersson",
        email: "anna@exempel.se",
        message: "Berätta hur vi kan hjälpa dig...",
      },
      errors: {
        requiredFields: "Fyll i alla fält.",
        generic: "Kunde inte skicka meddelandet. Försök igen.",
        serverError: "Något gick fel. Försök igen senare.",
      },
    },
    api: {
      requiredFields: "Fyll i alla obligatoriska fält.",
      invalidQuantity: "Antal måste vara mellan 1 och 99.",
      invalidProduct: "Ogiltig produkt vald.",
      invalidVariant: "Ogiltig styrka vald.",
      emptyCart: "Varukorgen är tom.",
      invalidCart: "Ogiltiga varor i varukorgen.",
      invalidDiscount: "Ogiltig rabattkod.",
      discountExhausted: "Rabattkoden har nått sin användningsgräns.",
      discountProductMismatch: "Rabattkoden gäller inte produkterna i varukorgen.",
      serverError: "Kunde inte behandla din beställning.",
    },
    calculator: {
      eyebrow: "Verktyg",
      title: "Peptidkalkylator",
      subtitle:
        "Välj dos, flaskstyrka och BAC-vatten — beräkna exakt hur många enheter du ska dra upp.",
      doseSectionTitle: "Önskad dos",
      strengthSectionTitle: "Peptidmängd i flaskan",
      waterSectionTitle: "Mängd BAC-vatten",
      customDoseLabel: "Ange anpassad dos (mg)",
      customStrengthLabel: "Ange anpassad mängd (mg)",
      customWaterLabel: "Ange anpassad vattenmängd (mL)",
      peptideAmount: "Peptidmängd (mg)",
      waterVolume: "Mängd BAC-vatten (mL)",
      desiredDose: "Önskad dosering (mg)",
      syringeSize: "Sprutstorlek",
      syringeU100: "U100 — 1 mL / 100 enheter",
      syringeU50: "U50 — 0,5 mL / 50 enheter",
      syringeU100Short: "U100 · 100 enheter",
      syringeU50Short: "U50 · 50 enheter",
      resultsTitle: "Resultat",
      resultPeptideDose: "Peptiddos",
      resultDrawSyringe: "Dra upp sprutan till",
      resultVialContains: "Din flaska innehåller",
      vialContainsValue: "{mg} mg i {ml} mL",
      selectValues: "Välj värden",
      unitsLabel: "enheter",
      resultEyebrow: "Ditt resultat",
      resultUnits: "Dra upp till {units} enheter på sprutan.",
      resultTicks: "Det motsvarar exakt {ticks} streck.",
      concentration: "Koncentration",
      drawVolume: "Volym att dra upp",
      exceedsWarning:
        "Dosen överskrider den valda sprutans kapacitet ({max} enheter). Välj en större spruta eller justera doseringen.",
      disclaimer:
        "Kalkylatorn är ett vägledande verktyg. Dubbelkolla alltid beräkningen och följ produktens officiella instruktioner.",
    },
    blog: {
      eyebrow: "Kunskap",
      title: "Blogg",
      subtitle:
        "Artiklar om peptider, dosering och den senaste forskningen.",
      searchLabel: "Sök artiklar",
      searchPlaceholder: "Sök artiklar, taggar eller ämnen…",
      filterAll: "Visa alla",
      filterDosing: "Dosering",
      filterResearch: "Forskningen",
      filterGuides: "Guider",
      emptyResults: "Inga artiklar matchade din sökning. Prova ett annat filter eller sökord.",
      backToBlog: "Tillbaka till bloggen",
      keyPoints: "Viktiga punkter",
    },
    labTestsPage: {
      eyebrow: "Transparens",
      title: "Tredjepartsanalyser och Labbtester",
      subtitle:
        "Varje batch vi säljer analyseras av oberoende laboratorier. Alla rapporter publiceras öppet så att du kan verifiera renhet och identitet innan du beställer.",
      statProducts: "Testade produkter",
      statPurity: "Snittrenhet",
      statLabs: "Oberoende labb",
      approved: "Godkänd",
      batchLabel: "Batch",
      labLabel: "Labb",
      testedLabel: "Testad",
      viewReport: "Visa Analysrapport",
      empty: "Inga labbtester publicerade ännu. Kom tillbaka snart.",
      whyTitle: "Varför publicerar vi våra labbtester?",
      whyBody:
        "De flesta leverantörer visar aldrig sina analysresultat. Vi gör tvärtom. Varje batch skickas till oberoende labb som analyserar renhet med HPLC och bekräftar identitet med masspektrometri. Resultaten publiceras här utan filter.",
      modalTitle: "Analysrapport",
      closeModal: "Stäng",
      openFullReport: "Öppna fullständig rapport",
    },
  },
  en: {
    brand: "SimpliCity",
    nav: {
      products: "Products",
      labTests: "Lab Tests",
      features: "Features",
      quality: "Quality",
      order: "Order",
      blog: "Blog",
      contact: "Contact",
      calculator: "Calculator",
      buyNow: "Buy Now",
    },
    hero: {
      badge: "SUPPORT 24/7",
      intake: "Premium ingredients for research",
      headline: "Quality without compromise",
      tagline: "Purity and quality in focus",
      subtitle:
        "SimpliCity is built for customers who expect more — carefully selected peptides, verified purity, and a premium experience without compromise.",
      ctaPrimary: "Explore collection",
      ctaCampaign: "View the offer",
      ctaSecondary: "See Benefits",
      stats: {
        purity: { label: "Purity", value: "100%" },
        shipping: { label: "Shipping", value: "24h" },
        support: { label: "Support", value: "24/7" },
      },
      featuredLabel: "Featured product",
      imagePlaceholder: "Product image",
    },
    products: {
      eyebrow: "Our collection",
      title: "Choose your product",
      subtitle:
        "Browse our collection and add products to your cart. Checkout updates instantly.",
      oneTime: "One-time purchase",
      addToCart: "Add to Cart",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      comingSoon: "Coming Soon",
      soldOut: "Sold Out",
      comingSoonButton: "Coming Soon",
      stockLow: "🔥 Only {{count}} left in stock!",
      stockAvailable: "📦 {{count}} in stock — Ships today!",
      stockStatus: {
        i_lager: "In Stock",
        ej_i_lager: "Out of Stock",
        kommer_snart: "Coming Soon",
      },
      variantLabel: "Strength",
      badges: {
        popular: "Best Seller",
        premium: "Premium",
      },
      items: {
        "melo-spray": {
          name: "Melanotan 2 (Nasal Spray)",
          description:
            "Premium Melanotan 2 in a convenient nasal spray — fast absorption and easy dosing.",
        },
        "melanotan-vial": {
          name: "Melanotan 2 (Vial)",
          description:
            "Melanotan 2 in injectable form — high purity and rigorously tested quality.",
        },
        retatrutide: {
          name: "Retatrutide",
          description:
            "Advanced peptide formula available in multiple strengths — choose the dose that fits your protocol.",
        },
        tirzepatide: {
          name: "Tirzepatide",
          description:
            "Our most requested peptide with flexible mg options — from 5 mg to 30 mg.",
        },
      } satisfies Record<ProductId, { name: string; description: string }>,
    },
    features: {
      eyebrow: "Why SimpliCity",
      title: "Made for those who expect more",
      subtitle:
        "We make it simple and safe to invest in premium wellness — with the transparency and quality you deserve.",
      items: [
        {
          title: "Certified ingredients",
          description:
            "Every formula is built on carefully selected, traceable raw materials with full transparency.",
        },
        {
          title: "Ships within 24 hours",
          description:
            "Most orders ship the same day. Free shipping on larger orders.",
        },
        {
          title: "Scandinavian quality",
          description:
            "Developed with Scandinavian precision and tested to strict quality standards.",
        },
        {
          title: "Secure checkout",
          description:
            "Your details are handled with care. Simple, fast, and secure ordering.",
        },
        {
          title: "Real support",
          description:
            "Questions? We respond within 24 hours — no chatbots, just real people.",
        },
        {
          title: "Full traceability",
          description:
            "Track every product from production to delivery. Total transparency.",
        },
      ],
    },
    quality: {
      eyebrow: "Guaranteed quality",
      title: "No compromises — from lab to you",
      description:
        "Every SimpliCity product undergoes rigorous quality control. From raw materials to finished product, each step is handled with precision and care.",
      checklist: [
        "Independent quality analysis for every batch",
        "Verified ingredients and purity guarantee",
        "Published results — see for yourself what you get",
        "Premium packaging for maximum shelf life",
      ],
    },
    cart: {
      title: "Your cart",
      empty: "Your cart is empty.",
      subtotal: "Subtotal",
      checkout: "Go to checkout",
      close: "Close cart",
      openCart: "Open cart",
      itemSingular: "item",
      itemPlural: "items",
      maxStockReached: "Maximum available stock quantity reached",
    },
    order: {
      eyebrow: "Order now",
      title: "Complete your order",
      subtitle:
        "Fill in your details below. Your cart and order summary update automatically.",
      addMore: "Add more",
      emptyCart: "Your cart is empty. Add products above.",
      name: "Full name",
      email: "Email address",
      address: "Shipping address",
      city: "City",
      state: "State / Region",
      zip: "Postal code",
      quantity: "Quantity",
      decreaseQty: "Decrease quantity",
      increaseQty: "Increase quantity",
      placeOrder: "Place Order",
      processing: "Processing order...",
      summary: "Order summary",
      subtotal: "Subtotal",
      shipping: "Shipping",
      total: "Total",
      free: "Free",
      freeShippingHint: "Spend {amount} kr more for free shipping",
      secureNote: "Secure mock checkout — no payment charged",
      shipsNote: "Ships within 24 hours",
      discount: {
        label: "Discount code",
        placeholder: "Enter code",
        apply: "Apply",
        applied: "Code applied!",
        invalid: "Invalid code",
        expired: "This code has reached its usage limit",
        productMismatch: "This code doesn't apply to items in your cart",
        lineLabel: "Discount",
      },
      errors: {
        generic: "Something went wrong. Please try again.",
        failed: "Order failed. Please try again.",
        emptyCart: "Add at least one product to your cart before ordering.",
      },
      placeholders: {
        name: "Jane Doe",
        email: "jane@example.com",
        address: "123 Main Street, Apt 4",
        city: "Stockholm",
        state: "Stockholm",
        zip: "111 22",
      },
      continueToPayment: "Continue to payment",
    },
    checkoutMethod: {
      eyebrow: "Payment",
      title: "Choose payment method",
      subtitle:
        "Pay instantly with card, Klarna, or Link — or send Bitcoin manually.",
      backToDetails: "← Back to shipping details",
      continue: "Continue →",
      stripe: {
        title: "Pay with Card / Klarna",
        subtitle: "Automatic payment via Stripe",
        badge: "Automatic",
        note: "Confirmed instantly after payment. Klarna, card, and Link supported.",
        eyebrow: "Stripe Checkout",
        description:
          "You'll be redirected to Stripe for secure payment. Your order is marked paid automatically.",
        orderTotal: "Amount due",
        secureNote: "Secure payment via Stripe. Shipping address collected for Sweden.",
        checkoutButton: "Go to secure checkout →",
        processing: "Preparing payment...",
        backToMethod: "← Back to payment method",
        errors: {
          submitFailed: "Could not start Stripe checkout. Please try again.",
        },
      },
      bitcoin: {
        title: "Pay with Bitcoin",
        subtitle: "Manual BTC payment",
        badge: "Manual",
        note: "Generate a BTC address and send payment. We approve manually after verification.",
      },
    },
    payment: {
      eyebrow: "Bitcoin payment",
      title: "Complete your BTC payment",
      subtitle:
        "Review the live rate and generate your unique Bitcoin payment address.",
      backToDetails: "← Back to shipping details",
      backToMethod: "← Back to payment method",
      walletWarning:
        "Send Bitcoin (BTC) only to the address below. Send from a personal wallet or Revolut.",
      exchangeBoard: {
        title: "Exchange rate",
        liveBadge: "LIVE RATE",
        orderTotal: "Order total",
        youSend: "You send",
        lockedRate: "Rate locked for",
        refreshNote: "Refreshes approximately every 15 minutes",
        fallbackNote: "Fallback rate in use — live API unavailable",
        sek: "SEK",
        usd: "USD",
      },
      generateAddress: "Generate Payment Address →",
      generating: "Generating address...",
      paymentReady: "Payment address ready",
      sendExactly: "Send exactly",
      toAddress: "To address",
      copyAddress: "Copy address",
      copied: "Copied!",
      openWallet: "👉 Open in wallet",
      qrLabel: "Scan QR code",
      qrUnavailable: "QR code unavailable",
      confirmationNote:
        "Your order is processed as soon as the transaction gains blockchain confirmations.",
      viewReceipt: "View order receipt →",
      errors: {
        selectNetwork: "Select a network to continue.",
        submitFailed: "Could not complete the order. Please try again.",
        walletNotConfigured:
          "Payment address is not configured. Contact the store or try again later.",
      },
    },
    success: {
      backToStore: "← Back to store",
      confirmed: "Order received",
      title: "Order Received — Awaiting Payment Confirmation",
      subtitle:
        "Your order has been registered. To complete your purchase, your crypto transaction must be verified on the blockchain. We will prepare your shipment as soon as your payment is manually approved by us (usually within 10–30 minutes).",
      pendingStatus: "🔴 Status: Awaiting payment",
      paidStatus: "🟢 Status: Payment confirmed",
      stripeTitle: "Thank you for your order!",
      stripeSubtitle:
        "Your Stripe payment has been confirmed. We're preparing your shipment and will email you a confirmation.",
      bitcoinTitle: "Order Received — Awaiting Payment Confirmation",
      bitcoinSubtitle:
        "Your order has been registered. To complete your purchase, your Bitcoin transaction must be verified. We will prepare your shipment as soon as your payment is manually approved by us (usually within 10–30 minutes).",
      receipt: "Receipt",
      justNow: "Just now",
      customer: "Customer",
      shippingTo: "Shipping to",
      item: "Item",
      qty: "Qty",
      amount: "Amount",
      subtotal: "Subtotal",
      shipping: "Shipping",
      totalPaid: "Total due",
      discount: "Discount",
      free: "Free",
      noOrder: "No order details found. You may have arrived here directly.",
      placeNew: "Place a new order →",
      emailConfirm: "An order confirmation will be sent to",
      delivery:
        "Shipment begins after we manually verify your crypto payment.",
      continue: "Continue shopping",
    },
    footer: {
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms",
      disclaimerLink: "Disclaimer",
      labTests: "Lab Tests",
    },
    legal: {
      lastUpdated: "Last updated",
      disclaimerLastUpdated: "17 June 2026",
      disclaimer: {
        title: "Disclaimer",
        subtitle:
          "Research products and chemical compounds — strictly intended for laboratory research, in vitro diagnostic testing, and scientific evaluation only. Not for consumption.",
        sections: [
          {
            heading: "1. Intended use — Research only",
            body: "All chemical products, peptides, and related substances sold through SimpliCity (the \"Products\") are intended exclusively for in vitro research, laboratory use, in vitro diagnostic testing, and scientific evaluation purposes. The Products are not intended, approved, or marketed for human or veterinary use, including but not limited to diagnosis, therapeutic treatment, consumption, injection, or any other form of administration to humans or animals.",
          },
          {
            heading: "2. Purchase terms and confirmation",
            body: "By completing a purchase on SimpliCity, the buyer confirms and warrants that:\n\n• The buyer is at least 18 years old and has the legal capacity to enter into agreements.\n• The Products will be used exclusively for legitimate research, laboratory work, and scientific evaluation.\n• The buyer does not intend to use the Products for personal use, consumption, or administration to themselves, any other person, or any animal.\n• The buyer has the necessary competence, equipment, and, where applicable, permits to handle the ordered substances in accordance with applicable laws and regulations.\n• The buyer is responsible for ensuring that purchase, possession, and use of the Products comply with all applicable laws and regulations in the buyer's jurisdiction.",
          },
          {
            heading: "3. Prohibited use",
            body: "It is expressly prohibited to use the Products for any of the following:\n\n• Human or veterinary use in any form, including but not limited to oral, intravenous, subcutaneous, intramuscular, or topical administration.\n• Use as food, dietary supplements, drugs, medical devices, or cosmetics.\n• Direct human consumption in any form.\n• Resale with marketing that suggests the Products are intended for human or animal consumption.\n• Any other use that violates applicable legislation, including regulations from the Swedish Medical Products Agency and EU directives.",
          },
          {
            heading: "4. Limitation of liability",
            body: "SimpliCity (the \"Company\") disclaims all liability for damages, losses, illness, adverse effects, or other negative consequences arising directly or indirectly from improper use, handling, or storage of the Products, including but not limited to use contrary to this disclaimer.\n\nThe Company makes no warranties, express or implied, regarding the suitability of the Products for any specific purpose beyond in vitro research and scientific evaluation. The Company is not responsible for any health risks, allergic reactions, or injuries arising from use that does not conform to the intended research use.",
          },
          {
            heading: "5. Right of cancellation",
            body: "The Company reserves the right to refuse, cancel, or revoke orders if there is reasonable cause to believe the Products are intended to be used in violation of this disclaimer, applicable laws, or in a manner that may cause harm. In such cases, any amount paid will be refunded minus costs already incurred.",
          },
          {
            heading: "6. Indemnification",
            body: "The buyer agrees to indemnify and hold harmless the Company, its owners, employees, and partners from all claims, lawsuits, damages, fines, costs (including reasonable legal fees), and other losses arising from the buyer's use of the Products in violation of this disclaimer or applicable law.",
          },
          {
            heading: "7. Regulatory information",
            body: "The Products have not been evaluated, approved, or registered by the Swedish Medical Products Agency, the European Medicines Agency (EMA), the U.S. Food and Drug Administration (FDA), or any equivalent regulatory authority in any jurisdiction. Nothing on this website shall be construed as medical advice, diagnosis, or treatment recommendation.",
          },
          {
            heading: "8. Labeling and handling",
            body: "All Products are labeled with the text \"For research purposes only — Not for human consumption\" or equivalent wording. The buyer is required to maintain this labeling and store the Products securely, out of reach of unauthorized persons.",
          },
          {
            heading: "9. Governing law",
            body: "This disclaimer is governed by and construed in accordance with Swedish law, without regard to conflict-of-law rules. Any disputes arising in connection with this disclaimer shall first be resolved through negotiation and, if no agreement can be reached, submitted to a competent court in Sweden.",
          },
          {
            heading: "10. Contact",
            body: "Questions about this disclaimer? Use the contact form on the homepage or reach us through the channels listed there.",
          },
        ],
      },
      privacy: {
        title: "Privacy Policy",
        subtitle:
          "How SimpliCity collects, uses, and protects your personal data.",
        sections: [
          {
            heading: "1. Introduction",
            body: "SimpliCity values your privacy. This policy describes what information we collect when you visit our site, place an order, or contact us — and how we handle it in accordance with GDPR.",
          },
          {
            heading: "2. Data we collect",
            body: "We may process your name, email address, shipping address, order history, and messages sent via our contact form. Technical data such as IP address and browser type may be logged for security and operations.",
          },
          {
            heading: "3. How we use your data",
            body: "Data is used to process orders, deliver products, provide customer support, and improve our service. We do not sell your personal information to third parties.",
          },
          {
            heading: "4. Storage and security",
            body: "Data is retained as long as needed to fulfill contracts or legal requirements. We take reasonable technical and organizational measures to protect your information from unauthorized access.",
          },
          {
            heading: "5. Your rights",
            body: "You have the right to request access, correction, or deletion of your data, and to object to certain processing. Contact us via the contact form to exercise your rights.",
          },
          {
            heading: "6. Contact",
            body: "Questions about this policy? Use the contact form on the homepage or reach us through the channels listed there.",
          },
        ],
      },
      terms: {
        title: "Terms of Use",
        subtitle:
          "Terms of use and guidelines for research and personal use.",
        sections: [
          {
            heading: "1. Acceptance of terms",
            body: "By using SimpliCity you agree to these terms. If you do not accept them, do not use the site or place orders.",
          },
          {
            heading: "2. Products and use",
            body: "Our products are sold for personal use and research purposes only. They are not intended to diagnose, treat, cure, or prevent disease. You are responsible for ensuring use complies with applicable laws in your jurisdiction.",
          },
          {
            heading: "3. Orders and payment",
            body: "All orders are subject to availability and confirmation. Payment is made according to instructions provided at checkout. We reserve the right to cancel orders suspected of fraud or violation of these terms.",
          },
          {
            heading: "4. Delivery",
            body: "Delivery times are estimates and may vary. Risk passes to you upon delivery under our shipping terms. You are responsible for providing a correct shipping address.",
          },
          {
            heading: "5. Research guidelines",
            body: "Customers using products in research contexts must follow good laboratory practice, document protocols carefully, and never redistribute products to unauthorized parties.",
          },
          {
            heading: "6. Limitation of liability",
            body: "SimpliCity is not liable for indirect or consequential damages arising from product use. Our liability is limited to the extent permitted by law to the amount you paid for the relevant order.",
          },
          {
            heading: "7. Changes",
            body: "We may update these terms. Continued use after published changes constitutes acceptance of the new terms.",
          },
        ],
      },
      labTests: {
        title: "Lab Tests",
        subtitle:
          "How we verify every batch — transparency from production to delivery.",
        sections: [
          {
            heading: "Independent batch analysis",
            body: "Every production batch undergoes independent quality analysis before release for sale. We test purity, identity, and concentration against established reference standards.",
          },
          {
            heading: "What we measure",
            body: "Typical analysis parameters include HPLC purity, endotoxin screening where applicable, and visual and functional packaging checks. Results are archived per batch number.",
          },
          {
            heading: "Published results",
            body: "Summary test results are published on this page on an ongoing basis. Full COA documents (Certificate of Analysis) can be requested via the contact form with your order or batch number.",
          },
          {
            heading: "Upcoming reports",
            body: "We are expanding this section with detailed batch reports. Until then, contact us for current test results for in-stock products.",
          },
        ],
        placeholder: {
          title: "Batch reports coming soon",
          body: "An interactive list of verified batches and downloadable COA files will be added here. In the meantime — ask us directly and we will share relevant documentation.",
        },
      },
    },
    errors: {
      notFound: {
        title: "Sidan kunde inte hittas",
        titleEn: "Page not found",
        description:
          "The link may be incorrect or the page may have moved. Return to the homepage and continue shopping.",
        backHome: "Back to homepage",
      },
      global: {
        title: "Något gick fel",
        titleEn: "Something went wrong",
        description:
          "An unexpected error occurred. Please try again or return to the homepage.",
        tryAgain: "Try again",
        backHome: "Back to homepage",
      },
    },
    trust: {
      shipping: {
        title: "Fast Shipping",
        description: "Dispatched within 1–3 business days across Sweden",
      },
      support: {
        title: "24h Support",
        description: "Fast email turnaround",
      },
      payment: {
        title: "Secure Payment",
        description: "Card, Klarna, Link, or Bitcoin",
      },
      quality: {
        title: "Premium Quality",
        description: "Carefully tested products of the highest grade",
      },
      securePayments: "🔒 Secure and discreet payments",
      shipWith: "We ship with",
    },
    reviews: {
      eyebrow: "Customer reviews",
      title: "Customer reviews",
      averageLabel: "Average",
      reviewCount: "{{count}} reviews",
      verifiedPurchase: "Verified purchase",
      writeReview: "Write a review",
      cancel: "Cancel",
      submit: "Submit review",
      noReviews: "No reviews yet — be the first to share your experience.",
      loading: "Loading reviews…",
      adminReplyLabel: "Reply from SimpliCity",
      form: {
        nameLabel: "Name",
        namePlaceholder: "Your name",
        ratingLabel: "Rating",
        textLabel: "Your review",
        textPlaceholder: "Tell us about your experience…",
        emailLabel:
          "Your email (Optional — if you want a reply to your review)",
        emailPlaceholder: "name@email.com",
        nameRequired: "Enter your name (at least 2 characters).",
        textRequired: "Write at least 10 characters in your review.",
        ratingRequired: "Choose a rating between 1 and 5 stars.",
        productLabel: "Which product did you purchase?",
        productPlaceholder: "Select product",
        productRequired: "Select which product you purchased.",
        emailInvalid: "Enter a valid email address or leave the field empty.",
        success:
          "Thank you! Your review has been submitted and will appear after approval.",
        error: "Could not submit your review. Please try again.",
      },
    },
    faq: {
      eyebrow: "FAQ",
      title: "Questions & answers",
      widgetTitle: "Support assistant",
      helperLabel: "Open support and frequently asked questions",
      teacherTag: "FAQ",
      close: "Close",
      subtitle:
        "Find answers to the most common questions about ordering, shipping, and our products.",
      feedbackPrompt: "Was this guide helpful?",
      feedbackPositive: "Helpful guide",
      feedbackNegative: "Not helpful",
      feedbackThanksPositive: "Thanks for your feedback!",
      feedbackThanksNegative: "Thanks — we'll improve the guide.",
    },
    contact: {
      eyebrow: "Contact us",
      title: "We're here for you",
      subtitle:
        "Questions about your order or our products? Send a message or reach us directly.",
      name: "Name",
      email: "Email",
      message: "Message",
      send: "Send message",
      sending: "Sending...",
      success: "Thank you! We'll get back to you within 24 hours.",
      directTitle: "Or contact us directly",
      telegram: "Telegram",
      emailLink: "Email",
      placeholders: {
        name: "Jane Doe",
        email: "jane@example.com",
        message: "Tell us how we can help...",
      },
      errors: {
        requiredFields: "Please complete all fields.",
        generic: "Could not send your message. Please try again.",
        serverError: "Something went wrong. Please try again later.",
      },
    },
    api: {
      requiredFields: "Please complete all required fields.",
      invalidQuantity: "Quantity must be between 1 and 99.",
      invalidProduct: "Invalid product selected.",
      invalidVariant: "Invalid strength selected.",
      emptyCart: "Cart is empty.",
      invalidCart: "Invalid items in cart.",
      invalidDiscount: "Invalid discount code.",
      discountExhausted: "This discount code has reached its usage limit.",
      discountProductMismatch: "This discount code doesn't apply to items in your cart.",
      serverError: "Unable to process your order.",
    },
    calculator: {
      eyebrow: "Tool",
      title: "Peptide Calculator",
      subtitle:
        "Select dose, vial strength, and BAC water — calculate exactly how many units to draw.",
      doseSectionTitle: "Dose of peptide",
      strengthSectionTitle: "Strength of peptide",
      waterSectionTitle: "BAC water volume",
      customDoseLabel: "Enter custom dose (mg)",
      customStrengthLabel: "Enter custom amount (mg)",
      customWaterLabel: "Enter custom water volume (mL)",
      peptideAmount: "Peptide amount (mg)",
      waterVolume: "BAC Water Volume (mL)",
      desiredDose: "Desired dose (mg)",
      syringeSize: "Syringe size",
      syringeU100: "U100 — 1 mL / 100 units",
      syringeU50: "U50 — 0.5 mL / 50 units",
      syringeU100Short: "U100 · 100 units",
      syringeU50Short: "U50 · 50 units",
      resultsTitle: "Results",
      resultPeptideDose: "Peptide dose",
      resultDrawSyringe: "Draw syringe to",
      resultVialContains: "Your vial contains",
      vialContainsValue: "{mg} mg in {ml} mL",
      selectValues: "Select values",
      unitsLabel: "units",
      resultEyebrow: "Your result",
      resultUnits: "Draw up to {units} units on the syringe.",
      resultTicks: "That equals exactly {ticks} tick marks.",
      concentration: "Concentration",
      drawVolume: "Volume to draw",
      exceedsWarning:
        "This dose exceeds the selected syringe capacity ({max} units). Choose a larger syringe or adjust the dose.",
      disclaimer:
        "This calculator is for guidance only. Always double-check your calculation and follow the product's official instructions.",
    },
    blog: {
      eyebrow: "Knowledge",
      title: "Blog",
      subtitle:
        "Articles on peptides, dosing, and the latest research.",
      searchLabel: "Search articles",
      searchPlaceholder: "Search articles, tags, or topics…",
      filterAll: "View all",
      filterDosing: "Dosing",
      filterResearch: "Research",
      filterGuides: "Guides",
      emptyResults: "No articles matched your search. Try a different filter or keyword.",
      backToBlog: "Back to blog",
      keyPoints: "Key points",
    },
    labTestsPage: {
      eyebrow: "Transparency",
      title: "Third-party analyses & lab tests",
      subtitle:
        "Every batch we sell is analyzed by independent laboratories. All reports are published openly so you can verify purity and identity before ordering.",
      statProducts: "Tested products",
      statPurity: "Average purity",
      statLabs: "Independent labs",
      approved: "Approved",
      batchLabel: "Batch",
      labLabel: "Lab",
      testedLabel: "Tested",
      viewReport: "View analysis report",
      empty: "No lab tests published yet. Check back soon.",
      whyTitle: "Why do we publish our lab tests?",
      whyBody:
        "Most suppliers never show their analysis results. We do the opposite. Every batch is sent to independent labs for HPLC purity analysis and mass spectrometry identity confirmation. Results are published here without filters.",
      modalTitle: "Analysis report",
      closeModal: "Close",
      openFullReport: "Open full report",
    },
  },
} as const;

export type TranslationKey = (typeof translations)[Locale];

export function getProductName(locale: Locale, productId: ProductId): string {
  return translations[locale].products.items[productId].name;
}

export function getProductDescription(
  locale: Locale,
  productId: ProductId,
): string {
  return translations[locale].products.items[productId].description;
}

export function formatMgOption(mg: number): string {
  return `${mg} mg`;
}

export function getProductLineLabel(
  locale: Locale,
  productId: ProductId,
  variantMg: number,
): string {
  return `${getProductName(locale, productId)} (${formatMgOption(variantMg)})`;
}

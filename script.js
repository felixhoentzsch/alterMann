let klickZaehler = 0;
let timerTimeout = null;

// --- 1. DER NORMALE GEBURTSTAGS-BUTTON ---
document.getElementById('start-btn').addEventListener('click', function() {
    
    confetti({
        particleCount: 150, 
        spread: 100,        
        origin: { y: 0.7 }, 
        colors: ['#AE1C28', '#FFFFFF', '#21468B', '#f97316'] 
    });

    klickZaehler++;
    const btn = document.getElementById('start-btn');

    if (klickZaehler === 1) {
        btn.innerText = "Da geht noch mehr! 🎉";
        timerTimeout = setTimeout(() => {
            klickZaehler = 0;
            btn.innerText = "Geschenk auspacken 🎁";
        }, 60000); 

    } else if (klickZaehler === 2) {
        btn.innerText = "Aller guten Dinge sind 3! 🚀";

    } else if (klickZaehler === 3) {
        clearTimeout(timerTimeout); 
        btn.innerText = "Gleich geht's los... 🌍";
        btn.style.pointerEvents = "none"; 

        setTimeout(() => {
            document.getElementById('intro-page').classList.add('fade-out');
            
            const mapPage = document.getElementById('map-page');
            mapPage.classList.remove('hidden');
            mapPage.classList.add('visible');

            setTimeout(() => {
                initMap(false); // "false" heißt: Mit Flug-Animation
            }, 1500); 

        }, 1500); 
    }
});

// --- 2. NEU: DER GEHEIME SKIP-BUTTON FÜR DICH ---
document.getElementById('secret-skip-btn').addEventListener('click', function() {
    clearTimeout(timerTimeout); // Falls der 60s Timer lief, stoppen wir ihn
    
    // Intro sofort unsichtbar machen (ohne weiches Ausfaden)
    document.getElementById('intro-page').style.display = 'none';
    
    // Karte sofort sichtbar machen
    const mapPage = document.getElementById('map-page');
    mapPage.classList.remove('hidden');
    mapPage.classList.add('visible');
    mapPage.style.opacity = '1';

    // Karte starten mit "true" (Instant = Keine Animation)
    initMap(true);
});

// --- 3. DIE KARTEN-FUNKTION ---
let map; 
let categoryLayers = {}; 

// NEU: Wir lesen den Speicher aus (oder starten bei 0, wenn noch nichts gespeichert ist)
let storedPlaces = JSON.parse(localStorage.getItem('amsterdamVisited')) || [];
let visitedPlaces = new Set(storedPlaces);

let clickedGifts = JSON.parse(localStorage.getItem('amsterdamGifts')) || { 1: false, 2: false, 3: false };
let triggeredMilestones = { 1: false, 2: false, 3: false }; 

// NEU: Die Speicher-Funktion
function saveProgress() {
    // Wandelt unsere Liste in Text um und speichert sie im Browser
    localStorage.setItem('amsterdamVisited', JSON.stringify([...visitedPlaces]));
    localStorage.setItem('amsterdamGifts', JSON.stringify(clickedGifts));
}


function initMap(instant = false) {
    const startCoords = instant ? [52.3676, 4.9041] : [45.0, 10.0];
    const startZoom = instant ? 14 : 4;

    map = L.map('map', { zoomControl: false }).setView(startCoords, startZoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    categoryLayers = {
        sehenswuerdigkeiten: L.layerGroup(),
        cafes: L.layerGroup(),
        restaurants: L.layerGroup(),
        funfacts: L.layerGroup(),
        shopping: L.layerGroup(),
        aktivitaeten: L.layerGroup(),
        mauri: L.layerGroup()
    };

    // --- UNSERE DATENBANK ---
    const places = [
        { id: 1, 
            cat: 'aktivitaeten', 
            lat: 52.3731, 
            lng: 4.8936, 
            emoji: '🏛️', 
            title: 'Königspalast', 
            desc: 'Pflichtprogramm am Dam Platz.', 
            img: 'Bilder/Palast.jpg' 
        },
        { 
            id: 2,
            cat: 'aktivitaeten',
            lat: 52.383,
            lng: 4.902,
            emoji: '🎡',
            title: 'A\'DAM Lookout',
            desc: 'Die höchste Schaukel Europas!',
            img: 'Bilder/ADAM.jpeg' 
        },
        { 
            id: 4, 
            cat: 'aktivitaeten', 
            lat: 52.3584, 
            lng: 4.8811, 
            emoji: '🌻', 
            title: 'Van Gogh Museum', 
            desc: 'Die größte Sammlung seiner Meisterwerke weltweit.', 
            img: 'Bilder/vangogh.jpg' 
        },
        {    
            id: 5, 
            cat: 'aktivitaeten', 
            lat: 52.3599, 
            lng: 4.8852, 
            emoji: '🖼️', 
            title: 'Rijksmuseum', 
            desc: 'Beeindruckende Kunst, Geschichte und atemberaubende Architektur.', 
            img: 'Bilder/Rijkmuseum.jpg' 
        },
        { 
            id: 6, 
            cat: 'shopping', 
            lat: 52.3698, 
            lng: 4.8893, 
            emoji: '🛋️', 
            title: 'HAY House', 
            desc: 'Wunderschönes Interior Design Shopping.', 
            img: 'Bilder/heyDesign.JPG' 
        },
        { 
            id: 7, 
            cat: 'aktivitaeten', 
            lat: 52.3680, 
            lng: 4.8900, 
            emoji: '📸', 
            title: 'Boothclub Garage', 
            desc: 'Coole analoge Fotoautomaten für die perfekten Erinnerungsstücke.', 
            img: 'Bilder/boothclub_ams.jpg' 
        },
        { 
            id: 8, 
            cat: 'aktivitaeten', 
            lat: 52.2700, 
            lng: 4.5464, 
            emoji: '🌷', 
            title: 'Keukenhof Gardens', 
            desc: 'Am besten in der 3. oder 4. April-Woche, dann blüht alles richtig krass!', 
            img: 'Bilder/tulpen.jpg' 
        },
        { 
            id: 9, 
            cat: 'aktivitaeten', 
            lat: 52.3774, 
            lng: 4.8972, 
            emoji: '🚤', 
            title: 'Canal Boat Tour', 
            desc: 'Amsterdam ganz entspannt vom Wasser aus erleben.', 
            img: 'Bilder/CanalTour.png' 
        },
        { 
            id: 10, 
            cat: 'aktivitaeten', 
            lat: 52.3580, 
            lng: 4.8686, 
            emoji: '🌳', 
            title: 'Vondelpark', 
            desc: 'Der perfekte Ort für einen entspannten Spaziergang im Grünen.', 
            img: 'Bilder/vondelpark.jpg' 
        },
        { 
            id: 11, cat: 'cafes', lat: 52.366, lng: 4.893, emoji: '🧇', 
            title: 'Van Wonderen', desc: 'Die besten Stroopwafels der Stadt!', 
            img: 'Bilder/your-stroopwafel-heaven.jpg' 
        },
        { 
            id: 12, cat: 'cafes', lat: 52.372, lng: 4.885, emoji: '☕', 
            title: 'Café de Jaren', desc: 'Toller Blick aufs Wasser.', 
            img: 'Bilder/cafe-jaren-terras.jpg'
        },
        { 
            id: 13, 
            cat: 'restaurants', lat: 52.368, lng: 4.885, emoji: '🍽️', 
            title: 'Pancakes Amsterdam', desc: 'Typisch holländische Pfannkuchen.', 
            img: 'Bilder/pancakes-amsterdam.jpg' 
        },
        { 
            id: 14,
            cat: 'restaurants', lat: 52.364, lng: 4.898, emoji: '🍕', 
            title: 'Foodhallen', desc: 'Riesige Halle mit Streetfood aus aller Welt.', 
            img: 'Bilder/Foodhallen.jpg' 
        },
        { 
            id: 15, cat: 'funfacts', lat: 52.363, lng: 4.900, emoji: '🚲', 
            title: 'Fahrrad-Friedhof', desc: 'Jedes Jahr werden tausende Räder aus dem Wasser gefischt.', 
            img: 'Bilder/city-amsterdam.jpg' 
        },
        { 
            id: 16, cat: 'funfacts', lat: 52.379, lng: 4.897, emoji: '🏠', 
            title: 'Schmälstes Haus', desc: 'Nur etwas über 2 Meter breit!', 
            img: 'Bilder/schmalsten-hauser-amsterdam.jpg' 
        },
        // --- MAURIS ÄSTHETISCHE CAFÉS & HOTSPOTS ---
        { 
            id: 17,
            cat: 'mauri',
            lat: 52.3797,
            lng: 4.8810, 
            emoji: '🥐', 
            title: 'SAINT-JEAN Bakery & Deli', 
            desc: 'Absolute Empfehlung!! Bakery & Café. Unbedingt den Pistachio Cruffin und Matcha probieren.', 
            img: 'Bilder/saintJean.JPG' },
        { 
            id: 18, 
            cat: 'mauri', 
            lat: 52.3685, 
            lng: 4.8762, 
            emoji: '🥖', 
            title: 'Pantopia', 
            desc: 'Ein Muss!! Wunderschöne Bakery und Café.', 
            img: 'Bilder/pantopia_2.JPG' 
        },
        { 
            id: 19, 
            cat: 'mauri', lat: 52.3551, lng: 4.8930, emoji: '🍵', 
            title: 'Lera Matcha', desc: 'Matcha-Liebe pur!! Einer der besten Spots dafür.', 
            img: 'Bilder/lera_4.JPG' 
        },
        { 
            id: 20, 
            cat: 'cafes', lat: 52.3662, lng: 4.8891, emoji: '🥐', 
            title: 'Bunbun', desc: 'Heiße Empfehlung: Die Pistazien-Roll ist der Wahnsinn!', 
            img: 'Bilder/bunbun.JPG' 
        },
        { 
            id: 21, cat: 'mauri', lat: 52.3621, lng: 4.8705, emoji: '☕', 
            title: 'Uncommon', desc: 'Richtig tolles, ästhetisches Café!!', 
            img: 'Bilder/uncommen.JPG' 
        },
        { 
            id: 22, cat: 'restaurants', lat: 52.3715, lng: 4.8623, emoji: '🍸', 
            title: 'Turbo Amsterdam', desc: 'Coole Bar/Restaurant. Super für Small Plates und Cocktails.', 
            img: 'Bilder/turbo.JPG' 
        },
        { 
            id: 23, cat: 'restaurants', lat: 52.3501, lng: 4.8904, emoji: '🍽️', 
            title: 'Bennies Amsterdam', desc: 'Super Spot für Lunch oder Dinner!', 
            img: 'Bilder/bennies_2.JPG' 
        },
        { 
            id: 24, cat: 'cafes', lat: 52.3678, lng: 4.8856, emoji: '🥞', 
            title: 'Carmen Amsterdam', desc: 'Die perfekte Location für einen tollen Brunch.', 
            img: 'Bilder/carmen.JPG' 
        },
        { 
            id: 25, cat: 'restaurants', lat: 52.3842, lng: 4.9150, emoji: '🍝', 
            title: 'Café Restaurant Metro', desc: 'Stylisch für Lunch oder ein gemütliches Dinner.', 
            img: 'Bilder/metro.JPG' 
        },
        { 
            id: 26, cat: 'cafes', lat: 52.3671, lng: 4.8552, emoji: '🍞', 
            title: 'Fort Negen', desc: 'Großartige, handwerkliche Bäckerei.', 
            img: 'Bilder/fortnegen.JPG' 
        },
        { 
            id: 27, cat: 'cafes', lat: 52.3734, lng: 4.8835, emoji: '🍰', 
            title: 'Ree 7', desc: 'Brunch, Lunch oder einfach Kaffee in den beliebten 9 Straatjes.', 
            img: 'Bilder/Ree7.JPG' 
        },
        { 
            id: 28, cat: 'cafes', lat: 52.3562, lng: 4.8911, emoji: '🥑', 
            title: 'Locals Coffee', desc: 'All Day Brunch – perfekt, wenn man spät aufsteht.', 
            img: 'Bilder/locals.JPG' 
        },
        { 
            id: 29, cat: 'restaurants', lat: 52.3705, lng: 4.8831, emoji: '🍟', 
            title: 'Fabel Friet', desc: 'Die wahrscheinlich besten Pommes! Unbedingt mit Trüffelmayo und Parmesan bestellen.', 
            img: 'Bilder/fabelfriet.JPG' 
        },
        { 
            id: 30, cat: 'restaurants', lat: 52.3751, lng: 4.8852, emoji: '🍝', 
            title: 'Linguini Trattoria', desc: 'Ein wunderbarer Italiener fürs Dinner.', 
            img: 'Bilder/Linguini.JPG' 
        },
        { 
            id: 31, cat: 'cafes', lat: 52.3693, lng: 4.8891, emoji: '🥐', 
            title: 'Layers', desc: 'Top Tipp! Bakery, Café, super Matcha und Lunch.', 
            img: 'Bilder/Gemini_Generated_Image_ev2rmyev2rmyev2r.png' 
        },
        { 
            id: 32, cat: 'mauri', lat: 52.3571, lng: 4.8964, emoji: '🥗', 
            title: 'Recover Food', desc: 'Healthy Food!! Super für Breakfast oder Lunch.', 
            img: 'Bilder/recoverFood_2.JPG' 
        },
        { 
            id: 33, cat: 'cafes', lat: 52.3585, lng: 4.8992, emoji: '🥯', 
            title: 'Bagel Boy', desc: 'Der beste Bagel der Stadt. Punkt.', 
            img: 'Bilder/bagelBoy.jpg' 
        },
        { 
            id: 34, cat: 'restaurants', lat: 52.3653, lng: 4.9121, emoji: '🍳', 
            title: 'Box Sociaal', desc: 'Brunch/Dinner. Es gibt 2 Locations – schaut, dass ihr die direkt am Wasserkanal erwischt!', 
            img: 'Bilder/boxSocial.jpg' 
        },
        { 
            id: 35, cat: 'cafes', lat: 52.3708, lng: 4.8805, emoji: '☕', 
            title: 'Elisabeth & Valentjin', desc: 'Spezialität: Tiramisu Latte und Matchamisu Latte!', 
            img: 'Bilder/elisabeth.JPG' 
        },
        { 
            id: 36, cat: 'cafes', lat: 52.3681, lng: 4.8884, emoji: '🍪', 
            title: 'Van Stapele', desc: 'Die besten Cookies Amsterdams!! Es gibt nur eine Sorte (Schoko mit weißem Kern), aber die ist legendär.', 
            img: 'Bilder/Van Stapele.jpg' 
        },
        { 
            id: 37, cat: 'restaurants', lat: 52.3655, lng: 4.8901, emoji: '🥪', 
            title: 'Broodje Gerard', desc: 'Die Adresse für richtig gute Sandwiches.', 
            img: 'Bilder/Broodje.png' 
        },
        { 
            id: 38, cat: 'restaurants', lat: 52.3701, lng: 4.8856, emoji: '🥪', 
            title: 'Chun', desc: 'Krasse Sandwiches!! Einer der absoluten Hypes in Amsterdam.', 
            img: 'Bilder/chun.JPG' 
        },
        { 
            id: 39, cat: 'cafes', lat: 52.3582, lng: 4.8931, emoji: '🧃', 
            title: 'Joe & the juice', desc: 'Açaí, Säfte, Sandwiches und unbedingt den Carrot Cake probieren!!', 
            img: 'Bilder/Joe_juice.JPG' 
        },
        { 
            id: 40, cat: 'restaurants', lat: 52.3605, lng: 4.8804, emoji: '🥞', 
            title: 'Lagom', desc: 'Entspannter All Day Brunch.', 
            img: 'Bilder/Lagom.JPG' 
        },
        { 
            id: 41, cat: 'cafes', lat: 52.3627, lng: 4.8821, emoji: '☕', 
            title: 'The Block Coffee', desc: 'Matcha, Coffee, Pastries, Sandwiches & Bowls.', 
            img: 'Bilder/block_coffee.jpg' 
        },
        { 
            id: 42, cat: 'cafes', lat: 52.3722, lng: 4.8833, emoji: '🥞', 
            title: 'Pluk', desc: 'Hübscher Hotspot zum Brunchen und Stöbern.', 
            img: 'Bilder/Pluk.JPG' 
        },
        { 
            id: 43, cat: 'mauri', lat: 52.3451, lng: 4.8854, emoji: '🥙', 
            title: 'Kaia', desc: 'Schickes Greek Restaurant.', 
            img: 'Bilder/kaia.JPG' 
        },
        { 
            id: 44, cat: 'restaurants', lat: 52.3762, lng: 4.8821, emoji: '🌮', 
            title: 'Madre', desc: 'Modernes mexikanisches Essen.', 
            img: 'Bilder/madre.JPG' 
        },
        { 
            id: 45, cat: 'cafes', lat: 52.3601, lng: 4.8882, emoji: '🍵', 
            title: 'Catcha', desc: 'Coffee, toller Matcha und Baked Goods.', 
            img: 'Bilder/catcha.JPG' 
        },
        { 
            id: 46, cat: 'cafes', lat: 52.3683, lng: 4.8951, emoji: '🍵', 
            title: 'Nia Matcha', desc: 'Der mysteriöse Spot... Existiert er noch? Findet es heraus!', 
            img: 'Bilder/NIA.JPG' 
        },
        { 
            id: 47, cat: 'cafes', lat: 52.3769, lng: 4.8802, emoji: '🌿', 
            title: 'Margos', desc: '100% Plantbased. Super Pastries und Matcha.', 
            img: 'Bilder/margos.JPG' 
        },
        { 
            id: 48, cat: 'cafes', lat: 52.3575, lng: 4.8924, emoji: '🥣', 
            title: 'Rainbowls', desc: 'Wunderschöne Smoothie-Bowls und Matcha.', 
            img: 'Bilder/rainbowls.jpg' 
        },
        { 
            id: 49, cat: 'cafes', lat: 52.3651, lng: 4.8855, emoji: '🍵', 
            title: 'Cloud', desc: 'Noch ein toller Spot für guten Matcha!', 
            img: 'Bilder/cloud.JPG' 
        },
        { 
            id: 50, cat: 'cafes', lat: 52.3664, lng: 4.8752, emoji: '🥐', 
            title: 'Et Claire', desc: 'Exzellente Pastries. Sehr zu empfehlen!', 
            img: 'Bilder/etClaire.JPG' 
        },
        { 
            id: 51, cat: 'cafes', lat: 52.3605, lng: 4.9081, emoji: '🍵', 
            title: 'Yusu', desc: 'Coole Vibes und sehr guter Matcha.', 
            img: 'Bilder/yusu.JPG' 
        },
        { 
            id: 52, cat: 'cafes', lat: 52.3556, lng: 4.8953, emoji: '☕', 
            title: 'Café Baskets', desc: 'Juice, Matcha, Coffee und Sandwiches.', 
            img: 'Bilder/cafebaskets.JPG' 
        },
        { 
            id: 53, cat: 'cafes', lat: 52.3652, lng: 4.8906, emoji: '🎨', 
            title: 'Two story', desc: 'Café, Matcha und Art Gallery in einem.', 
            img: 'Bilder/Two-Story.png'
        },
        { 
            id: 54, cat: 'restaurants', lat: 52.3552, lng: 4.8901, emoji: '🍳', 
            title: 'Oeuf', desc: 'Perfekt für den Brunch (alles dreht sich ums Ei!).', 
            img: 'Bilder/ouef.JPG' },
        { 
            id: 55, 
            cat: 'funfacts', 
            lat: 52.3755, 
            lng: 4.8945, 
            emoji: '🌷', 
            title: 'Tulpensaison', 
            desc: 'Gut zu wissen: Die offizielle Tulpensaison in den Niederlanden geht von Mitte März bis Mitte Mai!', 
            img: 'Bilder/tulpen.jpg' 
        },
        {
            id: 56,
            cat: 'aktivitaeten',
            lat: 52.37519, 
            lng: 4.88393, 
            emoji: '🪵',
            title: 'Anne Frank Haus',
            desc:'Historisches Tagebuch-Museum in der Prinsengracht',
            img:'Bilder/AnneFrank.jpg'
            
        },
        {
            id: 57,
            cat: 'aktivitaeten',
            lat: 52.370,
            lng: 4.912,
            emoji: '🎨',
            title: 'Hermitage Amsterdam',
            desc: 'Teil der Hermitage St. Petersburg mit wechselnden Ausstellungen',
            img: 'Bilder/Hermitage-Amsterdam.jpg'
        },
        {
            id: 58,
            cat: 'aktivitaeten',
            lat: 52.37419,
            lng: 4.91227,
            emoji: '🚀',
            title: 'NEMO Science Museum',
            desc: 'Wissenschaft & Technik mit Dachterrasse',
            img: 'Bilder/NEMO.jpeg'
        },
        {
            id: 59,
            cat:'aktivitaeten',
            lat: 52.378,
            lng: 4.882,
            emoji: '🌷',
            title: 'Tulpenmuseum Amsterdam',
            desc: 'Kleines Museum über die berühmten Blumen',
            img: 'Bilder/tulpenMuseum.jpg'
        },
        {
            id: 60,
            cat: 'aktivitaeten',
            lat: 52.37310, 
            lng: 4.89250,
            emoji: '🌃',
            title:  'Dam Square (Damrak)',
            desc: 'Zentraler Platz mit Königspalast & Nationaldenkmal',
            img: 'Bilder/DamSquare.jpg'
        },
        {
            id: 61,
            cat: 'aktivitaeten',
            lat: 52.36450,
            lng: 4.88260, 
            emoji: '🌃',
            title: 'Leidseplein',
            desc: 'Belebter Platz mit Bars, Clubs & Straßenshows',
            img: 'Bilder/Leidseplein.jpg'
        },
        {
            id: 62,
            cat: 'restaurants',
            lat: 52.36232,
            lng: 4.89700, 
            emoji: '🌃',
            title: 'Blue ° Amsterdam',
            desc: 'Panorama-Café/Restaurant mit Aussicht über die Stadt',
            img: 'Bilder/Blue.jpg'
        },
        {
            id: 63,
            cat: 'cafes',
            lat: 52.37810,
            lng: 4.88320, 
            emoji: '🍵',
            title: 'Cafe Winkel 43',
            desc: 'Beliebtes Café im Jordaan mit 1A Apfelkuchen',
            img: 'Bilder/cafeWinkel43.jpg'
        },
        { 
            id: 64, 
            cat: 'funfacts', 
            lat: 52.3735, 
            lng: 4.8865, 
            emoji: '🌉', 
            title: 'UNESCO Grachtengürtel', 
            desc: 'Amsterdam hat über 165 Kanäle mit mehr als 100 km Länge! Der berühmte U-förmige Grachtengürtel gehört seit 2010 zum Weltkulturerbe.', 
            img: 'Bilder/Amsterdam-Gracht.jpg' 
        },
        { 
            id: 65, 
            cat: 'funfacts', 
            lat: 52.3627, 
            lng: 4.9022, // Nähe Magere Brug (Skinny Bridge)
            emoji: '🌉', 
            title: 'Mehr Brücken als Venedig', 
            desc: 'Kaum zu glauben: Amsterdam hat über 1.200 Brücken! Venedig kommt im Vergleich auf "nur" etwa 400. Die berühmteste ist die Magere Brug.'
        },
        { 
            id: 66, 
            cat: 'funfacts', 
            lat: 52.3765, 
            lng: 4.8978, // Am Damrak
            emoji: '🏘️', 
            title: 'Tanzende Häuser', 
            desc: 'Warum sind viele Häuser hier so schief? Sie wurden auf Holzpfählen in sumpfigen Boden gebaut, die über die Jahrhunderte abgesackt sind. Man nennt sie auch "Dancing Houses".'
        },
        { 
            id: 67, 
            cat: 'funfacts', 
            lat: 52.3732, 
            lng: 4.8912, // Nähe Königspalast
            emoji: '🪵', 
            title: 'Stadt auf Stelzen', 
            desc: 'Ganz Amsterdam ruht auf rund 11 Millionen Holzpfählen tief im feuchten Boden. Allein der Königspalast wird von 13.659 Pfählen getragen!'
        },
        { 
            id: 68, 
            cat: 'funfacts', 
            lat: 52.3795, 
            lng: 4.8980, // Fietsflat am Bahnhof
            emoji: '🚲', 
            title: 'Mehr Räder als Einwohner', 
            desc: 'In Amsterdam leben etwa 880.000 Menschen, aber es gibt schätzungsweise 1,2 Millionen Fahrräder! Im Schnitt fährt ein Amsterdamer fast 1.000 km pro Jahr.'
        },
        { 
            id: 69, 
            cat: 'funfacts', 
            lat: 52.3660, 
            lng: 4.8966, // Rembrandtplein
            emoji: '❌', 
            title: 'Das XXX-Rätsel', 
            desc: 'Überall in der Stadt sieht man das "XXX"-Symbol. Es steht nicht für das Rotlichtviertel, sondern für die drei Andreaskreuze aus dem offiziellen Stadtwappen.'
        },
        { 
            id: 70, 
            cat: 'aktivitaeten', 
            lat: 52.3996, 
            lng: 4.8985, 
            emoji: '🎨', 
            title: 'NDSM-Werf & STRAAT', 
            desc: 'Kostenlose Fähre hinter dem Bahnhof nehmen! Altes Werftgelände voller cooler Street-Art, Flohmärkte und dem riesigen STRAAT Museum.', 
            img: 'Bilder/Straat-Museum.jpg' 
        },
        {
            id:71,
            cat: 'aktivitaeten',
            lat: 52.374,
            lng: 4.892, 
            emoji: '🍆',
            title: 'Sexmuseum Amsterdam',
            desc: 'Eines der ältesten Erotik-Museen der Welt',
            img: 'Bilder/Sexmuseum_Amsterdam.jpg'
        },
        {
            id:72,
            cat: 'aktivitaeten',
            lat: 52.35710,
            lng: 4.89130, 
            emoji: '🍻',
            title: 'Heineken Experience',
            desc: 'Interaktives Brauerei-Tour und Erlebniswelt',
            img: 'Bilder/heineken-experience.jpg'
        },
        {
            id:73,
            cat: 'aktivitaeten',
            lat: 52.366642,
            lng: 4.908071, 
            emoji: '🌳',
            title: 'Hortus Botanicus Amsterdam',
            desc: 'Der einzige Ort in Amsterdam, an dem "Gras" noch wissenschaftlich kategorisiert wird.',
            img: 'Bilder/HortusBrugOost.jpg'
        }


    ];

    places.forEach(place => {
        const icon = L.divIcon({ className: 'custom-emoji-marker', html: place.emoji, iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -20] });

        let titleHtml = place.cat !== 'funfacts' 
            ? `<a href="https://www.google.com/search?q=${encodeURIComponent(place.title + ' Amsterdam')}" target="_blank" class="popup-title">${place.title} 🔍</a>`
            : `<span class="popup-title">${place.title}</span>`;

        let toggleHtml = '';
        if (place.cat !== 'funfacts') {
            toggleHtml = `
                <label class="visited-toggle-wrapper">
                    <span class="toggle-label-text">Schon besucht?</span>
                    <input type="checkbox" class="visited-cb-hidden" data-id="${place.id}">
                    <div class="toggle-circle">
                        <svg class="toggle-check-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                </label>`;
        }

        let imageHtml = (place.img && place.img.trim() !== '') ? `<img src="${place.img}" alt="${place.title}" class="popup-header-img">` : '';

        const popupContent = `<div class="modern-popup">${imageHtml}<div class="popup-body">${titleHtml}<p class="popup-desc">${place.desc}</p>${toggleHtml}</div></div>`;

        L.marker([place.lat, place.lng], { icon: icon }).bindPopup(popupContent).addTo(categoryLayers[place.cat]);
    });

    const addPins = () => {
        const hotelIcon = L.divIcon({ className: 'custom-emoji-marker', html: '🚅', iconSize: [46, 46], iconAnchor: [23, 25], popupAnchor: [0, -23] });
        L.marker([52.378156, 4.899821], { icon: hotelIcon }).addTo(map)
            .bindPopup(`<div class="custom-popup" style="text-align: center; padding: 20px 10px;"><span style="color: #ea580c; font-weight: 800; font-size: 1.4rem; display: block; margin-bottom: 8px;">Hauptbahnhof</span><p style="color: #64748b; margin: 0; font-size: 1.1rem;">Hier geht unsere Reise los 🫶</p></div>`)
            .openPopup(); 

        for (let key in categoryLayers) { categoryLayers[key].addTo(map); }
    };

    // NEU: Wir rufen updateProgress() direkt auf, damit der Balken beim Laden der Seite den gespeicherten Stand anzeigt!
    if (instant) { 
        addPins(); 
        updateProgress(); 
    } else {
        setTimeout(() => { map.flyTo([52.3676, 4.9041], 14, { animate: true, duration: 4.5, easeLinearity: 0.25 }); }, 1000); 
        setTimeout(() => { addPins(); updateProgress(); }, 5500);
    }

    map.on('popupopen', function(e) {
        const checkbox = e.popup._contentNode.querySelector('.visited-cb-hidden');
        if (checkbox) {
            const placeId = parseInt(checkbox.getAttribute('data-id'));
            
            // Lese Zustand aus der Speichervariable
            checkbox.checked = visitedPlaces.has(placeId);

            checkbox.addEventListener('change', function() {
                if (this.checked) { visitedPlaces.add(placeId); } 
                else { visitedPlaces.delete(placeId); }
                
                // SOFORT SPEICHERN & BALKEN UPDATEN
                saveProgress(); 
                updateProgress(); 
            });
        }
    });
}

// --- 4. LOGIK FÜR DAS MENÜ ---
document.getElementById('sidebar-toggle').addEventListener('click', function() {
    document.getElementById('sidebar-content').classList.toggle('open');
});
document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        if (this.checked) { map.addLayer(categoryLayers[this.value]); } 
        else { map.removeLayer(categoryLayers[this.value]); }
    });
});

// --- 5. FORTSCHRITT & MEILENSTEINE (Mit Speicher-Logik) ---
document.getElementById('gift-1').addEventListener('click', function(e) {
    fireMiniConfetti(e.clientX, e.clientY); 
    triggerMilestone('Erstes Drittel geschafft! 🚲', 'Bilder/Foto2.png');
    this.style.display = 'none'; 
    clickedGifts[1] = true; // Klick speichern!
    saveProgress();
});

document.getElementById('gift-2').addEventListener('click', function(e) {
    fireMiniConfetti(e.clientX, e.clientY);
    triggerMilestone('Halbzeit in Amsterdam! 🌷', 'Bilder/Foto3.png');
    this.style.display = 'none';
    clickedGifts[2] = true; // Klick speichern!
    saveProgress();
});

function updateProgress() {
    const count = visitedPlaces.size;
    const wrapper = document.getElementById('progress-wrapper');
    if (count > 0) { wrapper.classList.remove('hidden'); } else { wrapper.classList.add('hidden'); }

    const displayCount = Math.min(count, 9);
    let blueCount = Math.min(displayCount, 3);
    let whiteCount = Math.max(0, Math.min(displayCount - 3, 3));
    let redCount = Math.max(0, displayCount - 6);

    document.getElementById('fill-blue').style.width = (blueCount / 3 * 33.33) + '%';
    document.getElementById('fill-white').style.width = (whiteCount / 3 * 33.33) + '%';
    document.getElementById('fill-red').style.width = (redCount / 3 * 33.33) + '%';

    // Meilenstein 1 
    if (count >= 3) {
        if (!clickedGifts[1] && !triggeredMilestones[1]) {
            document.getElementById('gift-1').classList.add('unlocked');
            triggeredMilestones[1] = true;
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#21468B', '#ffffff'] }); 
        } else if (clickedGifts[1]) {
            document.getElementById('gift-1').style.display = 'none'; // Verstecken, wenn schon mal geklickt wurde
        }
    }
    
    // Meilenstein 2 
    if (count >= 6) {
        if (!clickedGifts[2] && !triggeredMilestones[2]) {
            document.getElementById('gift-2').classList.add('unlocked'); 
            triggeredMilestones[2] = true;
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#ffffff', '#AE1C28'] });
        } else if (clickedGifts[2]) {
            document.getElementById('gift-2').style.display = 'none'; 
        }
    }

    // Meilenstein 3 (Finale - wird nur 1x ausgelöst)
    if (count >= 9 && !clickedGifts[3]) {
        triggerMilestone('Amsterdam Profis! 🎉', 'Bilder/Foto4.png');
        triggeredMilestones[3] = true;
        clickedGifts[3] = true; // Direkt als geklickt markieren, damit das Fenster beim Neuladen nicht wieder aufspringt
        saveProgress();
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } }); 
    }
}

function fireMiniConfetti(x, y) {
    const xNorm = x / window.innerWidth;
    const yNorm = y / window.innerHeight;
    confetti({ particleCount: 40, spread: 40, startVelocity: 20, origin: { x: xNorm, y: yNorm }, colors: ['#f97316', '#ffffff'] });
}

function triggerMilestone(title, imgSrc) {
    document.getElementById('milestone-title').innerText = title;
    document.getElementById('milestone-img').src = imgSrc;
    document.getElementById('milestone-modal').classList.add('show');
}

document.getElementById('close-milestone').addEventListener('click', () => {
    document.getElementById('milestone-modal').classList.remove('show');
});
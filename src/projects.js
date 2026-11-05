// Every project on the site. One card = one object in this list.
// The order here is the order on the page.
//
//   name         card title
//   description  one or two short sentences
//   github       repo link (star counts are loaded from GitHub automatically)
//   platforms    these become the filter buttons above the cards
//   tech         small tags at the bottom of the card
//   visual       animation at the top of the card, one of:
//                gauge, rings, wave, timetable, beads, dns, widget, panel, glass, spring
//                (leave it out for a plain monogram of the project name)
//   featured     true = the card is twice as wide on large screens
//   slug + page  the project's own page at /<slug>; the card links there. Stars, releases,
//                downloads and recent commits on it are loaded live from GitHub.
//
// `page` fields (all optional except tagline and intro):
//   tagline, intro      the big line and the paragraph under the name
//   preview             { src, alt, frame: 'window' | 'browser' } a large screenshot under the header
//   features            [{ title, text, screen?, frame? }]. With screens they sit next to a device;
//                       frame is 'phone' (default), 'watch' or 'plain'. Without, they're a grid of cards.
//                       Images live in public/projects/<slug>/.
//   specs               [{ value, suffix?, label, note, cycle? }] numbers roll in, `cycle` flips through words
//   install             [{ label, code }] copyable commands, for things that aren't an APK
//   requirements        [['Label', 'Value']]
//   note, license       a highlighted note and the license name
//   playground          bead colours and count for Cascade's demo

export const githubUser = 'david-x3d'
export const discord = { id: '940613901064736808', username: 'david_x3d' }

export const projects = [
  {
    name: 'Nomi',
    description:
      'A Material 3 Expressive nutrition journal. Log meals by typing, talking, snapping a photo or scanning a barcode.',
    github: 'https://github.com/david-x3d/nomi',
    platforms: ['Android', 'Wear OS'],
    tech: ['Kotlin', 'Jetpack Compose'],
    visual: 'rings',
    featured: true,
    slug: 'nomi',
    page: {
      tagline: 'A nutrition journal you can just talk to.',
      intro:
        'Write or say what you ate in plain language and every food lands as its own row, with calories, macros and where each number came from. Built with Jetpack Compose and Material 3 Expressive, with a Wear OS companion.',
      // Screenshots live in public/projects/<slug>/. `screen` is shown in a phone frame next to the feature.
      features: [
        {
          title: "Log it the way you'd say it",
          text: 'Type or dictate a meal in plain language. Every food becomes its own row, and "I ate 60 g less" fixes an amount without researching it again.',
          screen: '/projects/nomi/today-logged.webp',
        },
        {
          title: 'Every number has a source',
          text: 'Each entry shows which site Nomi mainly checked, how confident it is, and the pages behind the estimate.',
          screen: '/projects/nomi/nutrition-details.webp',
        },
        {
          title: 'Photos, labels and menus',
          text: 'Snap a meal or a nutrition label. Nomi estimates weights from plates and cutlery, and you check the grams before anything is logged. Whole restaurant menus work too.',
          screen: '/projects/nomi/today.webp',
        },
        {
          title: 'Reuse any past day',
          text: 'Search your history, copy a whole day or just the dinner, or keep it as a saved meal.',
          screen: '/projects/nomi/history.webp',
        },
        {
          title: 'Yours to tune',
          text: 'Ten languages, metric or US units, custom targets and micronutrients. API keys are encrypted with the Android Keystore.',
          screen: '/projects/nomi/settings.webp',
        },
      ],
      specs: [
        {
          value: 10,
          label: 'languages',
          cycle: ['Today', 'Heute', 'Hoy', "Aujourd'hui", 'Oggi', 'Vandaag', 'Hoje', 'Sot', 'Idag', 'Bugün'],
          note: 'Food names keep their own language, so Rührei mit Speck stays Rührei mit Speck.',
        },
        { value: 4, label: 'ways to log', note: 'Text, voice, photo and barcode.' },
        { value: 'NFC', label: 'tap to share', note: 'Hold two phones together to share a day. No pairing, account or server.' },
        { value: 'Watch', label: 'Wear OS companion', note: "What's left today, dictation, favorites, a tile and a complication." },
      ],
      requirements: [
        ['Phone', 'Android 8.0 or newer'],
        ['Watch', 'Wear OS 3 or newer'],
        ['AI features', 'Your own provider API key'],
      ],
      note: 'Bring your own API key. AI research and photo analysis use the provider you pick, and your diary stays on the phone.',
      license: 'PolyForm Noncommercial',
    },
  },
  {
    name: 'Flare',
    description: 'A native Android speed test. Measures ping, jitter, download and upload over Cloudflare.',
    github: 'https://github.com/david-x3d/Flare',
    platforms: ['Android'],
    tech: ['Kotlin', 'Coroutines', 'MVVM'],
    visual: 'gauge',
    slug: 'flare',
    page: {
      tagline: 'A speed test that shows its work.',
      intro:
        "Measures ping, jitter, download and upload against Cloudflare's speed test servers, with a live gauge and a history of every run. Kotlin, Jetpack Compose and Material 3 Expressive.",
      features: [
        { title: 'Ping and jitter', text: 'Ten latency probes: ping is the median, jitter the standard deviation.' },
        {
          title: 'Download and upload',
          text: 'Parallel connections with payloads growing from 100 kB to 25 MB, scored by the 90th percentile.',
        },
        {
          title: 'Live gauge',
          text: 'A speed dial, a phase track from ping to upload and a live throughput chart. Stop it any time.',
        },
        {
          title: 'Quality at a glance',
          text: 'A 0 to 100 score, a bufferbloat grade from loaded latency, and verdicts for calls, streaming and gaming.',
        },
        {
          title: 'Full mode',
          text: "49 single-connection transfers in Cloudflare's own order, with timing per transfer and CSV export.",
        },
        {
          title: 'History',
          text: 'Every result stored on the phone, with network and period filters, a trend chart and swipe to delete.',
        },
      ],
      specs: [
        { value: 10, label: 'latency probes', note: 'Plus one warm-up, timed to the response headers.' },
        { value: 49, label: 'transfers in Full mode', note: '515.8 MB of planned payload within a 180-second budget.' },
        { value: 90, suffix: 'th', label: 'percentile', note: "Throughput is scored robustly, so one slow round doesn't sink it." },
        { value: 2, label: 'languages', note: 'English and German.' },
      ],
      requirements: [['Phone', 'Android 8.0 or newer']],
      note: "Not affiliated with Cloudflare. The measurement endpoints aren't a documented API and could change.",
      license: 'MIT',
    },
  },
  {
    name: 'Tempest',
    description: "A wavy, expressive thermometer for your phone's battery and SoC.",
    github: 'https://github.com/david-x3d/tempest',
    platforms: ['Android'],
    tech: ['Kotlin', 'Jetpack Compose', 'M3 Expressive'],
    visual: 'wave',
    slug: 'tempest',
    page: {
      tagline: 'See how hot your phone feels.',
      intro:
        'A thermometer for the battery and chip, drawn in morphing Material shapes and waves that ripple harder as things heat up. No root needed, no ads, and nothing leaves the device.',
      features: [
        {
          title: 'Overview',
          text: 'The battery and the hottest chip zone side by side, with heat level, trend in °C per minute and charge.',
          screen: '/projects/tempest/overview.webp',
        },
        {
          title: 'Battery',
          text: 'Temperature, voltage, current, power, charge cycles, health, and time to full or runtime left.',
          screen: '/projects/tempest/battery.webp',
        },
        {
          title: 'Every thermal zone',
          text: 'All zones the kernel exposes, hottest first, plus cooling devices and thermal headroom. Shizuku or root unlock the rest.',
          screen: '/projects/tempest/sensors.webp',
        },
        {
          title: 'Knows your chip',
          text: "The chip's name with its maker's emblem, live clock per core, clusters, GPU, RAM, storage and display.",
          screen: '/projects/tempest/cpu.webp',
        },
        {
          title: 'Make it yours',
          text: 'SoC profiles for everyday use, gaming or your own limit, custom heat levels, alerts and reminders, °C or °F.',
          screen: '/projects/tempest/settings.webp',
        },
      ],
      specs: [
        { value: 24, suffix: ' h', label: 'of history', note: 'An animated wave you can scrub to read any point.' },
        { value: 4, label: 'languages', note: 'English, German, French and Italian.' },
        { value: 0, label: 'root needed', note: 'Shizuku or root only add readings. Everything runs read-only.' },
        { value: 'Alerts', label: 'when it gets hot', note: 'A heads-up notification, an optional lock-screen alarm and a Quick Settings tile.' },
      ],
      requirements: [
        ['Phone', 'Android 12 or newer'],
        ['Optional', 'Shizuku or root for more readings'],
      ],
      license: 'MIT',
    },
  },
  {
    name: 'Material Untis',
    description: 'An unofficial Material 3 timetable app for Untis, with a Wear OS companion for your wrist.',
    github: 'https://github.com/david-x3d/Material-Untis',
    platforms: ['Android', 'Wear OS'],
    tech: ['Kotlin', 'Material 3'],
    visual: 'timetable',
    slug: 'material-untis',
    page: {
      tagline: 'Your timetable, on your phone and your wrist.',
      intro:
        "An unofficial Untis client in Material 3 Expressive. The phone signs in, keeps a local cache and sends today's lessons to the watch. The watch never talks to WebUntis itself.",
      features: [
        {
          title: 'Week grid',
          text: 'Double periods joined, substitutions highlighted, cancelled lessons marked, a "now" line, and swipes between weeks.',
          screen: '/projects/material-untis/timetable.webp',
        },
        {
          title: 'Lesson details',
          text: 'Subject, teacher, room, class, substitution text and times for every period.',
          screen: '/projects/material-untis/lesson.webp',
        },
        {
          title: 'Absences',
          text: 'The whole school year, filtered by excused, unexcused or open, and Report sick straight to the school.',
          screen: '/projects/material-untis/absences.webp',
        },
        {
          title: 'On your wrist',
          text: "A now and next card with a countdown, today's lessons, a sync button and a next-lesson complication.",
          screen: '/projects/material-untis/watch.webp',
          frame: 'watch',
        },
        {
          title: 'Colours and sync',
          text: 'Automatic or hand-picked subject colours, background sync every 15 to 60 minutes, and a demo mode with sample data.',
          screen: '/projects/material-untis/settings.webp',
        },
      ],
      specs: [
        { value: 15, suffix: ' min', label: 'background sync', note: "Or every 30 or 60. Today's lessons go to the watch after each sync." },
        { value: 0, label: 'passwords on the watch', note: 'Only a small gzipped summary of today goes over the Data Layer.' },
        { value: 'TOTP', label: 'secret login', note: 'Scan the Untis QR code instead of typing a password.' },
        { value: 'Demo', label: 'mode', note: 'Every screen with an invented school, no account needed.' },
      ],
      requirements: [
        ['Phone', 'Android 8.0 or newer'],
        ['Watch', 'Wear OS 3 or newer'],
        ['Account', 'A WebUntis student or parent login'],
      ],
      note: 'Unofficial community project, not affiliated with Untis GmbH. Your password stays encrypted on the phone.',
    },
  },
  {
    name: 'Cascade',
    description: 'Realistic fidget beads for Wear OS and Android. Tilt and they pour.',
    github: 'https://github.com/david-x3d/Cascade',
    platforms: ['Wear OS', 'Android'],
    tech: ['Kotlin', 'Physics', 'Accelerometer'],
    visual: 'beads',
    featured: true,
    slug: 'cascade',
    page: {
      tagline: 'Glass beads in your pocket. Tilt and they pour.',
      intro:
        'Hundreds of glassy beads in a shallow tray. Tilt, shake, stir and throw them with your fingers. Written in Kotlin on the plain Android SDK: no game engine and no third-party runtime libraries.',
      // Bead colours and count controls under the live demo.
      playground: {
        colors: {
          Azure: ['#2f7bf0', '#58a8ff', '#1b56c9', '#8fcaff'],
          Pearl: ['#ddd6cb', '#efebe4', '#c4bbad', '#fbfaf7'],
          Amber: ['#f0a020', '#ffc35a', '#d17f08', '#ffdb94'],
          Emerald: ['#18a874', '#3fd09a', '#0c875c', '#86e8c0'],
        },
        count: [30, 220, 110],
      },
      features: [
        {
          title: 'Real impulse physics',
          text: 'Spheres with varied sizes and masses, friction, spin, rolling resistance and sleeping, stepped at a fixed 240 Hz.',
        },
        {
          title: 'Baked glass lighting',
          text: 'Azure gradients, sharp highlights, a translucent rim and soft shadows. Fast beads brighten.',
        },
        {
          title: 'Sound and haptics',
          text: 'Synthesized glass clicks with limited polyphony, and impact-only haptics with an energy budget so it never buzzes nonstop.',
        },
        {
          title: 'Watch and phone',
          text: 'A round tray on Wear OS with the crown for bead count, and an edge-to-edge tray on the phone you can stir with several fingers.',
        },
        {
          title: 'Four colours',
          text: 'Azure, Pearl, Amber and Emerald on the phone, and 100 to 2,000 beads.',
        },
        {
          title: 'Nothing else',
          text: 'No accounts, no ads and no network permission. It works the same on a plane.',
        },
      ],
      specs: [
        { value: 240, suffix: ' Hz', label: 'physics step', note: 'Four 60 Hz substeps, separate from the display refresh rate.' },
        { value: 16, label: 'impulse iterations', note: 'Per substep, with Coulomb friction coupling slide and spin.' },
        { value: 2000, label: 'beads on a phone', note: '100 to 600 on the watch.' },
        { value: 120, suffix: ' ms', label: 'haptic cooldown', note: 'Impact-only, with a replenishing energy budget.' },
      ],
      requirements: [
        ['Phone', 'Android 11 or newer'],
        ['Watch', 'Wear OS 3 or newer'],
      ],
    },
  },
  {
    name: 'adns-controld',
    description: "Manage Control D and NextDNS from your phone, with native control over Android's Private DNS.",
    github: 'https://github.com/david-x3d/adns-controld',
    platforms: ['Android'],
    tech: ['Kotlin'],
    visual: 'dns',
    slug: 'adns-controld',
    page: {
      tagline: 'Control D and NextDNS, managed natively.',
      intro:
        "An Android app for your Control D account that also points Android's Private DNS at it. Profiles, filters, rules, statistics and logs are native screens, no WebViews. NextDNS works with the same screens.",
      features: [
        {
          title: 'Profiles and endpoints',
          text: 'Create, clone and rename profiles, and choose which endpoint and profile this phone uses.',
        },
        {
          title: 'Statistics',
          text: 'Query graphs, top domains, block reasons, devices, countries, protocols and encryption.',
        },
        {
          title: 'Activity log',
          text: 'Search, filter by device, export CSV, and block or unblock a domain right from a log entry.',
        },
        {
          title: 'Filters and rules',
          text: 'Native and third-party filters, service blocking, allow and deny lists, and DNS rewrites.',
        },
        {
          title: 'Private DNS switch',
          text: "Android's Private DNS on or off with one tap and no VPN, with Wi-Fi rules and a Quick Settings tile.",
        },
        {
          title: 'Other devices',
          text: 'Add endpoints and set them up with an Apple .mobileconfig profile or copy-ready addresses.',
        },
      ],
      specs: [
        {
          value: 8,
          label: 'DNS providers',
          note: 'Control D, NextDNS, AdGuard, Cloudflare, Google, Quad9, OpenDNS or a custom hostname.',
        },
        { value: 0, label: 'WebViews', note: 'Every screen is built natively.' },
        { value: 0, label: 'telemetry', note: 'Tokens are stored encrypted and only sent to the provider they belong to.' },
        { value: 2, label: 'build flavors', note: 'foss talks only to your DNS provider; normal also checks GitHub for updates.' },
      ],
      requirements: [
        ['Account', 'A Control D or NextDNS API token'],
        ['Private DNS', 'A one-time Shizuku or ADB setup'],
      ],
      note: 'Started from ADNS by Eyal Meirom and keeps its Private DNS client and NextDNS integration. Not affiliated with Control D or NextDNS.',
      license: 'MIT',
    },
  },
  {
    name: 'clawd-usage-android',
    description: 'Home-screen widgets for your Claude plan limits, with Clawd and a live sky. No server needed.',
    github: 'https://github.com/david-x3d/clawd-usage-android',
    platforms: ['Android'],
    tech: ['Kotlin', 'Jetpack Compose', 'Material You'],
    visual: 'widget',
    slug: 'clawd-usage-android',
    page: {
      tagline: 'Your Claude limits on the home screen, with Clawd.',
      intro:
        'Widgets with the same session, weekly and per-model limits as /usage in Claude Code. The phone asks Anthropic directly with no server in between, and Clawd the crab reacts to what your limits are doing.',
      features: [
        {
          title: 'Clawd lives in it',
          text: "He sleeps when nothing happens, runs while usage climbs, sweats near the limit and lies belly-up when it's used up. Tap him for a heart.",
          screen: '/projects/clawd-usage-android/widget.gif',
          frame: 'plain',
        },
        {
          title: 'Three sizes',
          text: 'Small, medium and large, all resizable, adding rows for Fable, activity, status and account as space allows.',
          screen: '/projects/clawd-usage-android/large.webp',
          frame: 'plain',
        },
        {
          title: 'A real sky',
          text: "Real sunrise and sunset, the moon's actual phase, and live weather: clouds, rain, snow, fog and thunderstorms.",
          screen: '/projects/clawd-usage-android/medium.webp',
          frame: 'plain',
        },
        {
          title: 'Official numbers only',
          text: 'The same limits claude.ai and /usage show. Reading them spends no tokens.',
          screen: '/projects/clawd-usage-android/small.webp',
          frame: 'plain',
        },
        {
          title: 'Expressive settings',
          text: 'Dynamic colours, segmented groups, and a live preview of the widget you can tap.',
          screen: '/projects/clawd-usage-android/app.webp',
        },
      ],
      specs: [
        { value: 3, label: 'widget sizes', note: '2×2, 4×2 and 4×4, all resizable.' },
        { value: 33, label: 'languages', note: 'From Catalan to Korean.' },
        { value: 0, label: 'servers', note: 'The phone talks to Anthropic directly. Nothing runs on your computer.' },
        {
          value: 'Flip-book',
          label: 'animation',
          note: "Widgets can't run timers, so the app renders Clawd's next seconds ahead and hands them to the launcher.",
        },
      ],
      requirements: [
        ['Phone', 'Android 12 or newer'],
        ['Account', 'A Claude plan'],
      ],
      note: 'An Android port of clawd-usage-winwidget by @Enhed: layout, Clawd and the sky are ported line by line. Not affiliated with Anthropic.',
      license: 'MIT',
    },
  },
  {
    name: 'KDE Liquid Glass',
    description:
      'A Liquid Glass setup for KDE Plasma inspired by macOS Tahoe: Darkly, WhiteSur icons, Better Blur DX and rounded corners.',
    github: 'https://github.com/david-x3d/kde-plasma-liquid-glass-theme',
    platforms: ['Linux'],
    tech: ['Shell', 'KDE Plasma'],
    visual: 'glass',
    slug: 'kde-liquid-glass',
    page: {
      tagline: 'A glassy Plasma desktop, set up by one script.',
      intro:
        'A full KDE Plasma setup inspired by the macOS Tahoe Liquid Glass look: Darkly, BreezeEnhanced, WhiteSur icons, a modified Layan Plasma style, Better Blur DX and rounded corners. The installer takes a fresh profile most of the way there.',
      preview: {
        src: '/projects/kde-liquid-glass/desktop.webp',
        alt: 'A KDE Plasma desktop with translucent, blurred panels and windows over a seaside wallpaper',
        frame: 'window',
      },
      features: [
        {
          title: 'One installer',
          text: 'Dry-run first, then --full-setup builds the components, writes KDE settings, sets the panel layout and reloads Plasma.',
        },
        {
          title: 'Works across distros',
          text: 'Arch, Debian and Ubuntu, Fedora, openSUSE and NixOS, plus immutable systems like Bazzite and SteamOS.',
        },
        { title: 'Backs up first', text: 'kdeglobals, kwinrc and the other configs are copied aside before anything is written.' },
        {
          title: 'Fails gracefully',
          text: "Each component builds on its own. If one fails, the rest still install and the settings fall back to what's there.",
        },
        { title: 'Glass everywhere', text: 'Deep blur, transparent panels, borderless windows and rounded corners.' },
        { title: 'Discord too', text: 'A modified Midnight theme for Vesktop, with the blur showing through.' },
      ],
      specs: [
        { value: 6, label: 'components', note: 'Darkly, BreezeEnhanced, WhiteSur, Layan, Better Blur DX and KDE Rounded Corners.' },
        { value: 6, label: 'distro families', note: 'Detected from /etc/os-release, derivatives included.' },
        { value: 4, label: 'CI containers', note: 'Arch, Debian sid, Fedora and openSUSE Tumbleweed run a full build.' },
        { value: 'Wayland', label: 'or X11', note: "Effects are built for whichever KWin you're running." },
      ],
      install: [
        {
          label: 'Clone with submodules',
          code: 'git clone --recurse-submodules https://github.com/david-x3d/kde-plasma-liquid-glass-theme.git\ncd kde-plasma-liquid-glass-theme',
        },
        { label: 'Preview, then install', code: 'scripts/install.sh --dry-run\nscripts/install.sh --full-setup' },
      ],
      requirements: [
        ['Desktop', 'KDE Plasma 6'],
        ['Blur', 'Better Blur DX supports Plasma 6.5 and 6.6'],
      ],
      note: 'Run it as your normal user, not with sudo. It asks for sudo itself, only for packages and system paths.',
      license: 'MIT',
    },
  },
  {
    name: 'plasma-clawd-usage',
    description: 'A KDE Plasma 6 widget that shows your Claude plan usage, with Clawd the crab living in it.',
    github: 'https://github.com/david-x3d/plasma-clawd-usage',
    platforms: ['Linux'],
    tech: ['QML', 'JavaScript', 'Plasma 6'],
    visual: 'panel',
    slug: 'plasma-clawd-usage',
    page: {
      tagline: 'Your Claude limits in the Plasma panel.',
      intro:
        'A KDE Plasma 6 widget with the same numbers as /usage in Claude Code, refreshed every minute, and Clawd the pixel crab living in it. Plain QML with no dependencies.',
      features: [
        {
          title: 'Live sessions',
          text: 'How many Claude Code sessions are running, working or waiting for you. Clawd waves when one needs you.',
          screen: '/projects/plasma-clawd-usage/tour.gif',
          frame: 'plain',
        },
        {
          title: 'Clawd sleeps',
          text: 'With no Claude Code running, he burrows into the sand and naps.',
          screen: '/projects/plasma-clawd-usage/sleep.gif',
          frame: 'plain',
        },
        {
          title: 'Click him',
          text: 'A random Claude Code animation and a heart.',
          screen: '/projects/plasma-clawd-usage/clicks.gif',
          frame: 'plain',
        },
        {
          title: 'Hearts are health',
          text: "The hearts are the session limit that's left, and they change how he moves.",
          screen: '/projects/plasma-clawd-usage/hearts.gif',
          frame: 'plain',
        },
        {
          title: 'A real sky',
          text: "Time of day, the moon's phase and live weather, for your location or any city you pick.",
          screen: '/projects/plasma-clawd-usage/weather.gif',
          frame: 'plain',
        },
        {
          title: 'Resets and limits',
          text: 'Confetti when the 5-hour window resets. At 100% he lies belly-up.',
          screen: '/projects/plasma-clawd-usage/reset.gif',
          frame: 'plain',
        },
      ],
      specs: [
        { value: 60, suffix: ' s', label: 'refresh', note: 'Limits come from claude -p "/usage", which spends no tokens.' },
        { value: 16, label: 'languages', note: 'It follows your system language by default.' },
        { value: 0, label: 'dependencies', note: 'Plain QML that ships with Plasma 6.' },
        { value: 'Panel', label: 'or desktop', note: 'A full window on the desktop, a coloured percentage in a panel.' },
      ],
      install: [
        {
          label: 'Install',
          code: 'git clone https://github.com/david-x3d/plasma-clawd-usage.git\ncd plasma-clawd-usage\nkpackagetool6 -t Plasma/Applet -i package',
        },
        { label: 'Update after a git pull', code: 'kpackagetool6 -t Plasma/Applet -u package' },
      ],
      requirements: [
        ['Desktop', 'KDE Plasma 6'],
        ['Needs', 'Claude Code, installed and logged in'],
      ],
      note: 'A port of clawd-usage-winwidget by Venger Sergey: layout, pixel art and sky are taken one to one. Not affiliated with Anthropic.',
      license: 'MIT',
    },
  },
  {
    name: 'claude-smooth',
    description: 'Soft, springy animations for claude.ai without changing how it looks. Firefox and Chromium.',
    github: 'https://github.com/david-x3d/claude-smooth',
    platforms: ['Browser'],
    tech: ['JavaScript', 'WebExtension'],
    visual: 'spring',
    slug: 'claude-smooth',
    page: {
      tagline: 'claude.ai, with springs.',
      intro:
        'A browser extension that adds soft, springy motion to claude.ai without changing how it looks. Replies fade in word by word, menus grow out of their buttons, the sidebar glides. Colours, fonts and layout stay as they are.',
      preview: {
        src: '/projects/claude-smooth/demo.svg',
        alt: 'A message lifts off, the reply fades in line by line, the sidebar slides out and back in',
        frame: 'browser',
      },
      features: [
        { title: 'Replies', text: 'Words fade in one after another and come into focus, instead of arriving in chunks.' },
        { title: 'Messages', text: "Your message lifts off the input box and Claude's reply rises in." },
        { title: 'Menus and dialogs', text: 'They grow out of their button, items cascade in, and they shrink back when closing.' },
        { title: 'Sidebar', text: 'Slides out with the chat following at the same pace, instead of snapping shut.' },
        { title: 'Real springs', text: "Damped springs like SwiftUI's, computed once and stored as CSS linear() curves." },
        {
          title: 'Text stays text',
          text: 'The word fade uses the CSS Custom Highlight API, so copying and selecting work as always.',
        },
      ],
      specs: [
        { value: 10, label: 'switches', note: 'Every effect can be turned off on its own.' },
        { value: 1, label: 'permission', note: 'Only storage, for your settings. No network requests.' },
        { value: '0.5–1.8×', label: 'tempo', note: 'From fast to gentle.' },
        { value: 'Firefox', label: 'and Chromium', note: 'Signed by Mozilla. A Linux script sets up Chrome, Brave, Edge and friends.' },
      ],
      install: [
        {
          label: 'Chromium browsers on Linux',
          code: 'curl -fsSLO https://raw.githubusercontent.com/david-x3d/claude-smooth/main/install/chromium-linux.sh\nsudo bash chromium-linux.sh',
        },
      ],
      requirements: [
        ['Firefox', '142 or newer'],
        ['Chromium', '117 or newer'],
      ],
      note: "With your system's reduce-motion setting on, claude.ai stays untouched. Not affiliated with Anthropic.",
      license: 'MIT',
    },
  },
]

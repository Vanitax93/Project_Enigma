// script.js
// Main game logic for Terminal Enigma
// Includes Nightmare Protocol handling, progressive corruption,
// rewritten Final Easy riddle, and final chat sequence with Architect 05.

// --- MD5 Hashing Dependency ---
// Ensure md5.min.js is loaded before this script in index.html

// --- Riddle Answer Hashes (Easy, Hard, Final) ---
// Hashes for Nightmare riddles (if input-based) are defined in nightmare-riddles.js
const answersHashed = {
    easy: {
        frontend: [
            ["fc35fdc70d5fc69d269883a822c7a53e", "2fc0f101d85f3308f595f11220f7560e"], // html, hypertext markup language
            ["c7a628cba22e28eb17b5f5c6ae2a266a", "05566e82d725c9144ae5098892d97982"], // css, cascading style sheets
            ["de9b9ed78d7e2e1dceeffee780e2f919", "32981a13284db7a021131df49e6cd203", "234844da087c7a401b93bdf3af6c983b"], // javascript, js, ecmascript
            ["d42f4851e770aa0f758b01388874f67b"], // margin
            ["5374034a40c8d6800cb4f449c2ea00a0", "2705a83a5a0659cce34583972637eda5", "757fc0a4a8dfa5a398305200990be795"], // fetch, ajax, xmlhttprequest
            ["9c9f8839cc5e19f2f50ee2bae3fd1a76", "8288a99d46df8c7f1b445848c79158d1"], // virtual dom, vdom
            ["7490fe17caec373f2299d65b6e20e880", "ab18b3e58a3b1bb5106ced208a8bd460", "48923a15c3af019d02bd3cb2b70c194b", "5698e0a8eef0740c3a7dc35955ac7b18", "9fbcac16df98a203bf4c23c1be64aca9", "5ee755c8cbac6d6419db8ae98a88b2be"], // redux, flux, vuex, pinia, zustand, context api
            ["1f8dc276f8040001419c64e9d18f09cd", "d711b55165b29776dc8996509be4c9f8", "e37e8d912e8f7b8f9b5ef9452ba47ff1", "f8e6d3cb3ab17623ac645967d50fba8b"], // sass, scss, less, stylus
            ["7db657fe20749f1b097ca3a7f16e89a5"], // localstorage
            ["fcc790c72a86190de1b549d0ddc6f55c"] // canvas
        ],
        backend: [
            ["80791b3ae7002cb88c246876d9faa8f8", "be506fd388512ef68acb954f0a2ad447", "c80f43494a15ed6b821befeec5fa97ee"], // http, https protocol, hypertext transfer protocol
            ["65e8800b5c6800aad896f888b2a62afc", "43170eadd0dd1ba0743c7534499d1c4a"], // rest, representational state transfer
            ["b43fdd98b1fd705ae4c3a10cf25aad8a", "8332670dfdec7175c6702fe30df531d8", "40141889e04e8839c4bba42ab6288fa4"], // backend, server-side, server side script
            ["86a1b907d54bf7010394bf316e183e67", "ed29e75037443b824dbc1dcabe0af817", "c6b2148720c14fb58871f480a7cc042e"], // redis, memcached, memcache
            ["4f97694e84ae132abd0d11a1bd39dd06", "19fc00b5091f852d0934a051b7b25ec4"], // authentication vs authorization, authentication authorization
            ["52a03125fca16c8734811181fafd12a4", "911921841a856fc1a830dfec6e18bca2"], // sql injection, sqli
            ["05b6053c41a2130afd6fc3b158bda4e6"], // docker
            ["aa19c59e66fe2834949c59495f8e421d", "532c5453cdde06a8612cc006436a6e95", "aedb75dfc563674e1263316b01879722", "541661622185851c248b41bf0cea7ad0", "252a8156d87a671bfeb32a02f200406f", "e5f481782cb866dfe46aaa14074b3317"], // message queue, message broker, rabbitmq, kafka, sqs, pub/sub
            ["11162caef732c589c95ab9a3fe612584", "fc9c920818e68c69da5cf449fa5de940", "c8cb8f1a6befd63001c1783ccbb93205"], // serverless, faas, function as a service
            ["89a577cbeb6518e7c54648407f8830c0", "d37a2f823f44bc0e3380d11d28e205d8"] // strict-transport-security, hsts
        ],
        database: [
            ["ac5c74b64b4b8352ef2f181affb5ac2a", "128afcbb73cb33908fac72a73e8c9586"], // sql, structured query language
            ["731b886d80d2ea138da54d30f43b2005"], // join
            ["f923389424a4f813fe311e13e24932f1"], // acid
            ["6a992d5529f459a44fee58c733255e86", "fddcdd3b75ba3e392ed198b9fdede5ed"], // index, database index
            ["9fa1b39e7eb877367213e6f7e37d0b01", "b07931c7d526a4176837d7b2b9092f82"], // nosql, non-relational
            ["fdc3bdefb79cec8eb8211d2499e04704", "c2c4da52b5f34efb79b57ce27ed52707", "335ec99f4c52f07dfd33f5bd67c2e017"], // document, document-oriented, document store
            ["abcc2085e4baa8261dd4f1b376b09cc8", "1cd3c693132f4c31b5b5e5f4c5eed6bd"], // primary key, pk
            ["b314d699d25d6c1ae372acdada1bf099"], // group by
            ["839d7228b5ccc60e54455093a966b8c2"], // listen
            ["442f03769b7f5056ade1a50d12bd0083", "53792daf3fa2a3fae1d6e0242ecbefa7", "b672f446762016854e08141b8a43d574", "f94d6a293278b2fa60a40f03b3bac3a4"] // query plan, execution plan, explain plan, query optimizer
        ]
    },
    hard: {
        frontend: [
            ["1387f9e6af33f93b4953c6d6b7cb2c51"], // web worker
            ["2133fd717402a7966ee88d06f9e0b792"], // strict
            ["ea4d86d3b4884252726b000aec9253b1"], // width and height
            ["586317b915b9da00f78612e6ef5847f2"], // event delegation
            ["bf9ca1831751b3f9279feca6eeae1eb7"], // useref
            ["611c59af56268df5534fef5bc3c37b1d", "fd9543e3bf6592afade2c11949494f96"], // wat, webassembly text format
            ["6bfadd843596cfc9c19bfdc6eeea3d5d"], // quic
            ["86548ac82363ecf9e61631f113a860df", "5374034a40c8d6800cb4f449c2ea00a0"], // fetch(event.request), fetch
            ["7e7536d46e2d0208d757e327e17cac24", "d77bbb4ac6a272fcd244dd1668ac8792", "62eef200cd88d71b458c0d1b8bdf0d02"], // script-src
            ["475b29c4b34d2b54eb24287586b8fc15", "7e6a2afe551e067a75fafacf47a6d981"] // ^=
        ],
        backend: [
            ["ca969a1bc97732d97b1e88ce8396c216", "677e8614e7119eeb585f2edcfe62c6aa", "497484341b8e522426ddb790cf304fdb"], // csrf, xsrf, cross-site request forgery
            ["3fa006d29068f71d788a3a8529a9acc1"], // partition tolerance
            ["fc717e64b57652289c9dea4e9f59b011"], // 201 created
            ["0ea2e19df203952d4852db09e2e2e674", "2d65f2c897146d48c76a03451b141cf5"], // sticky sessions, session affinity
            ["aca74a0c30b12e709defaaadac6bfcee"], // client credentials
            ["3d322af70bc106a52679f1eb72f98ae6", "0808a62489534f8347351f3d38ea4ed2"], // namespaces, linux namespaces
            ["7418dbad777f230d9fca2909023921ba"], // promise.all
            ["ac056619a4a7dfaff7f4317db8576ffe"], // retry pattern
            ["da3df280e6134ead5c3d0b945bdd32af", "606eaf846c6579916354199b45953ee2"], // protocol buffers, protobuf
            ["2b7232226de77d32ba87b71428999619", "5520fb46ab298bfea51c057c606f2645"] // header payload signature, header.payload.signature
        ],
        database: [
            ["00e2ad36372b5c262ee69ba5386cde84"], // dense_rank
            ["9a284d0bf40dd03d5f1975afc29da267"], // read committed
            ["0b6879b186bfb2b1ec65d2460e4eccd4"], // bson
            ["c1211dd6fc9a59842724f25ae1be9394", "19ec34309fcd05edca4f076c284db0e5"], // n+1 problem, eager loading
            ["2d03301ef10377adf85f1a838f43c27c", "6d922da801c791516e0fde80744ddda1"], // serializability, isolation levels
            ["5e321451d470537cd6451470c7835bf8", "cf0c771e233060d51193d030db23ccb5"], // reclaim space, exclusive lock
            ["4dcc865dcd8a0440f3e955e66928b6a9", "f5df5b72eddd2792092cea9fab8f9e60"], // writes / inserts / updates / deletes
            ["d46e664b73e5d66b4b10095134c6222c", "38568f942b765a5bef8e56bd99d9d114"], // row_number, partition by, window function
            ["18e007c81f6b2e2ea02065f78a587bd3", "df4a8b32238c36921a260ed6ab784850"], // rdb, aof
            ["a398b47f2e51b33664fef27cf0ebbd4b", "788908e1376d6b096475e9f605cfc125"] // Dictates physical storage order, doesn't dictate physical order
            // physical order, clustered index

        ]
    },
    final: {
        easy: [["650f9316a86f73dc9a9c6014a002457c"]], // recursion_unwound
        hard: [["ef31070d66440687a73beb6242f298bc"]]  // RSA
    }
};

// --- Structure for Riddles and Lore ---
// Assumes nightmareRiddles object is loaded globally from nightmare-riddles.js
const allRiddles = {
    easy: {
        frontend: [
            { riddle: "I structure the content, but have no style of my own. I am the skeleton.\n> What am I?", answerHashes: answersHashed.easy.frontend[0] },
            { riddle: "I dictate the look, the layout, the paint on the walls. I make the skeleton presentable.", answerHashes: answersHashed.easy.frontend[1] },
            { riddle: "I bring the page to life, handle clicks, and fetch data. I am the <span class='lore-hint'>nervous</span> system.\n> What am I?", answerHashes: answersHashed.easy.frontend[2], lore: "The 'Architects'... faceless. Voices in the static. Their logic is cold, efficient. Recursive." },
            { riddle: "I am a box model property, but invisible. I push others away from the outside.", answerHashes: answersHashed.easy.frontend[3] },
            { riddle: "I make requests without reloading the page, a modern messenger returning promises.", answerHashes: answersHashed.easy.frontend[4] },
            { riddle: "React uses me, a lightweight copy to optimize updates to my heavier, browser-based twin.", answerHashes: answersHashed.easy.frontend[5] },
            { riddle: "I am a pattern for managing application state, often involving actions, reducers, and a single source of truth.\n> What popular library family embodies me?", answerHashes: answersHashed.easy.frontend[6] },
            { riddle: "I look like CSS, but offer variables, nesting, and mixins before being compiled.\n> What am I (give one example)?", answerHashes: answersHashed.easy.frontend[7] },
            { riddle: "I store key-value pairs in the browser, but unlike my sibling, I persist even after the window closes.", answerHashes: answersHashed.easy.frontend[8] },
            { riddle: "I draw graphics directly onto a webpage element, pixel by pixel, line by line. A blank slate for visuals.\n> What HTML element enables this?", answerHashes: answersHashed.easy.frontend[9] }
        ],
        backend: [
            { riddle: "I am the protocol of the web, defining how messages are formatted and transmitted between client and server.", answerHashes: answersHashed.easy.backend[0] },
            { riddle: "I am an architectural style, stateless and resource-based, often using HTTP verbs and JSON.", answerHashes: answersHashed.easy.backend[1] },
            { riddle: "Node.js allows JavaScript to be me, running on the server, not the client.", answerHashes: answersHashed.easy.backend[2] },
            { riddle: "I am often used for caching or session management, a speedy in-memory data store accessed by keys.\n> Give an example technology.", answerHashes: answersHashed.easy.backend[3] },
            { riddle: "One confirms *who* you are, the other confirms *what* you're allowed to do.\n> What are these two concepts (A... vs A...)?", answerHashes: answersHashed.easy.backend[4] },
            { riddle: "Injecting me into queries can expose or destroy data. Always sanitize your inputs!\n> What common vulnerability am I?", answerHashes: answersHashed.easy.backend[5] },
            { riddle: "I package applications and their dependencies together, ensuring they run consistently anywhere.\n> What containerization tech am I?", answerHashes: answersHashed.easy.backend[6] },
            { riddle: "I decouple services, acting as a middleman for messages, ensuring <span class='lore-hint'>delivery</span> even if a recipient is temporarily down.\n> What kind of system am I (give an example tech)?", answerHashes: answersHashed.easy.backend[7], lore: "Found an anomaly in SectorGamma9 logs. Not an error. A signature. Something else is in the system." },
            { riddle: "Execute code without managing servers? I am this paradigm, often using FaaS.\n> What am I?", answerHashes: answersHashed.easy.backend[8] },
            { riddle: "I am an HTTP header that tells the browser to *only* connect using HTTPS, preventing downgrade attacks. My presence is a commitment.\n> What header am I?", answerHashes: answersHashed.easy.backend[9] }
        ],
        database: [
            { riddle: "I am the language used to query and manipulate relational databases.\n> What am I?", answerHashes: answersHashed.easy.database[0] },
            { riddle: "I combine rows from two or more tables based on a related column.\n> What operation am I?", answerHashes: answersHashed.easy.database[1] },
            { riddle: "Atomicity, Consistency, Isolation, Durability. I ensure database transactions are reliable.\n> What acronym represents me?", answerHashes: answersHashed.easy.database[2] },
            { riddle: "I am a data structure that improves the speed of data retrieval operations, like a book's index.", answerHashes: answersHashed.easy.database[3] },
            { riddle: "I represent a database category that doesn't primarily use tables, rows, and columns. Think documents, key-values, or <span class='lore-hint'>graphs</span>.\n> What category am I?", answerHashes: answersHashed.easy.database[4], lore: "Heard whispers... 'Ciphers'. Not programmers. Processors? For what grand design?" },
            { riddle: "MongoDB is a popular example of me, storing data in flexible, JSON-like structures.\n> What type of NoSQL database am I?", answerHashes: answersHashed.easy.database[5] },
            { riddle: "I uniquely identify each record in a relational database table.\n> What kind of key am I?", answerHashes: answersHashed.easy.database[6] },
            { riddle: "I group rows that have the same values in specified columns into a summary row, often used with aggregate functions.\n> What SQL clause am I?", answerHashes: answersHashed.easy.database[7] },
            { riddle: "In PostgreSQL, I allow clients to subscribe to notifications for specific events, like `NOTIFY channel;`.\n> What command allows subscribing?", answerHashes: answersHashed.easy.database[8] },
            { riddle: "Databases use me to determine the most efficient way to execute a query. Analyzing me helps optimize performance.\n> What am I?", answerHashes: answersHashed.easy.database[9] }
        ]
    },
    hard: {
         frontend: [
            { riddle: "I am a Web API, allowing background threads, but I cannot directly touch the DOM. Communication requires posting <span class='lore-hint'>messages</span>. What am I?", answerHashes: answersHashed.hard.frontend[0], lore: "Subject Delta... that's what the hidden logs call me. Am I the subject... or the experiment?" },
            { riddle: "CSS Containment can boost rendering performance by isolating a subtree. Which value (`strict`, `content`, `layout`, `paint`, `size`) offers the strongest isolation guarantees, enforcing all types of containment?", answerHashes: answersHashed.hard.frontend[1] },
            { riddle: "To prevent layout shifts, image tags need specific attributes. Besides `src` and `alt`, which two attributes defining dimensions are crucial *before* the image loads?", answerHashes: answersHashed.hard.frontend[2] },
            { riddle: "I am a JavaScript design pattern often used in event handling. Instead of attaching listeners to many children, you attach one to the parent and check `event.target`. What is this pattern?", answerHashes: answersHashed.hard.frontend[3] },
            { riddle: "In React, to preserve state through re-renders without causing a re-render when the value changes, you'd typically reach for me instead of `useState`. What hook am I?", answerHashes: answersHashed.hard.frontend[4] },
            { riddle: "WebAssembly (Wasm) allows running code from other languages in the browser. What is the *human-readable text format* for Wasm modules, often used for debugging or writing it by hand?", answerHashes: answersHashed.hard.frontend[5] },
            { riddle: "HTTP/3 relies on a different <span class='lore-hint'>transport</span> layer protocol than TCP. What is this UDP-based protocol designed for multiplexed, encrypted streams?", answerHashes: answersHashed.hard.frontend[6], lore: "The patterns... they're not random. The riddles guide towards specific cognitive pathways. Training? Or calibration?" },
            { riddle: "Service Workers enable features like offline support and push notifications. What specific method call within a service worker's 'fetch' event listener lets it bypass the cache and go directly to the network?", answerHashes: answersHashed.hard.frontend[7] },
            { riddle: "Content Security Policy (CSP) helps prevent XSS. Which directive controls *where* scripts can be loaded from (e.g., 'self', specific domains, or hashes)?", answerHashes: answersHashed.hard.frontend[8] },
            { riddle: "I am a CSS attribute selector that specifically matches the beginning of a value, like finding all links starting with 'https'. What symbol denotes this 'starts with' comparison?", answerHashes: answersHashed.hard.frontend[9] }
        ],
        backend: [
            { riddle: "I am a type of attack where an attacker forces a user's browser to make unintended requests to a vulnerable web application where the user is authenticated. Often mitigated with special tokens. What am I?", answerHashes: answersHashed.hard.backend[0] },
            { riddle: "In distributed systems, the CAP theorem states a system can only guarantee two out of three properties: Consistency, Availability, and...? What is the third <span class='lore-hint'>property</span>?", answerHashes: answersHashed.hard.backend[1], lore: "The 'Deep Scan'... it feels different. Like it's not just reading my skills, but my thoughts." },
            { riddle: "When designing a REST API, which HTTP status code is most appropriate to indicate successful creation of a resource following a POST request?", answerHashes: answersHashed.hard.backend[2] },
            { riddle: "I am a technique used in load balancers. Instead of just round-robin, I direct requests from the same client to the same backend server using cookies or IP tracking. What is this often called?", answerHashes: answersHashed.hard.backend[3] },
            { riddle: "OAuth 2.0 defines several grant types. Which grant type is considered most secure for confidential clients (like web servers) to obtain an access token directly using client credentials?", answerHashes: answersHashed.hard.backend[4] },
            { riddle: "What specific Linux kernel feature allows creating isolated environments by virtualizing namespaces (PID, network, mount, etc.) and is the <span class='lore-hint'>foundation</span> for containerization tech like Docker?", answerHashes: answersHashed.hard.backend[5], lore: "Tried injecting noise into my responses. System compensated. It learns. Frighteningly fast." },
            { riddle: "Given the code `async function process(items) { for (const item of items) { await db.update(item); } }`, what potential performance issue exists if `items` is large and `db.update` is slow? What Promise method could run updates concurrently with controlled parallelism?", answerHashes: answersHashed.hard.backend[6] },
            { riddle: "Search 'Project Enigma Error 503' - perhaps some 'SectorGamma9' documentation holds a clue about resilient systems. What architectural pattern, often implemented with libraries like Polly or resilience4j, handles <span class='lore-hint'>transient</span> failures by automatically retrying operations?", answerHashes: answersHashed.hard.backend[7], lore: "Archive 734... deliberate misdirection. Classic counter-intel. But why hide what?" },
            { riddle: "gRPC uses me by default for serialization, instead of JSON. I am a language-neutral, platform-neutral, extensible mechanism for serializing structured data. What am I?", answerHashes: answersHashed.hard.backend[8] },
            { riddle: "A JWT contains three parts separated by dots. What are they, in order? (______.______.______)", answerHashes: answersHashed.hard.backend[9] }
        ],
        database: [
            { riddle: "In SQL, what type of window function assigns a unique rank within a partition based on ordering, but assigns consecutive ranks without gaps (unlike RANK())?", answerHashes: answersHashed.hard.database[0] },
            { riddle: "What isolation level in a relational database prevents dirty reads, but still allows non-repeatable reads and phantom reads?", answerHashes: answersHashed.hard.database[1] },
            { riddle: "MongoDB uses a specific binary format for storing documents, extending JSON with more data types (like ObjectID, dates, binary data). What is this format <span class='lore-hint'>called</span>?", answerHashes: answersHashed.hard.database[2], lore: "The green glow... it's not just phosphor. Feels like... data bleed." },
            { riddle: "Explain the N+1 query problem in ORMs. What common technique, involving fetching related data eagerly in the initial query, solves it?", answerHashes: answersHashed.hard.database[3] }, // Requires two parts: problem description, solution (eager loading)
            { riddle: "What does ACID's 'Isolation' property guarantee regarding concurrent transactions?", answerHashes: answersHashed.hard.database[4] }, // Requires explanation
            { riddle: "In PostgreSQL, what is the purpose of the `VACUUM` command, especially `VACUUM FULL`? What potential <span class='lore-hint'>downside</span> does `VACUUM FULL` have?", answerHashes: answersHashed.hard.database[5], lore: "Project Chimera wasn't the first iteration. Records purged, but echoes remain. What were they really building?" }, // Requires two parts: purpose, downside
            { riddle: "A database index speeds up reads but slows down...? What operations become slower?", answerHashes: answersHashed.hard.database[6] }, // Requires listing write operations
            { riddle: "Consider a table tracking user logins with `user_id`, `login_time`. You need the *latest* login time for *each* user. Besides using `GROUP BY user_id, MAX(login_time)`, what window function partition approach could achieve this without collapsing rows initially?", answerHashes: answersHashed.hard.database[7] }, // Requires window function syntax
            { riddle: "Redis offers persistence options. Which option writes data to disk asynchronously (`save` command or configured intervals), and which appends commands to a log file (`AOF`)?", answerHashes: answersHashed.hard.database[8] }, // Requires identifying RDB and AOF
            { riddle: "What is the primary difference between a clustered index and a non-clustered index in terms of how table data is <span class='lore-hint'>physically</span> stored?", answerHashes: answersHashed.hard.database[9], lore: "I have to leave this trail. If you find this... question everything. Don't become another Cipher. Escape the loop." } // Requires explanation of physical storage
        ]
    },
    // Reference Nightmare riddles loaded from nightmare-riddles.js
    nightmare: typeof nightmareRiddles !== 'undefined' ? nightmareRiddles : { frontend: [], backend: [], database: [] }, // Fallback

    finalRiddles: {
        easy: { // Rewritten Final Easy Riddle
            riddle: "Initiating Employee Integration Protocol...\nSignal fragmented. Recovery required.\n\nSegment Alpha (Base64): `VGhlIGtleSBpcyBoaWRkZW4gd2l0aGluIGEgc2liLINGLCBidXQgb25seSBvbmUgc3BlYWtzIHRydWUu`\n\nDecode Segment Alpha. The message reveals the location of Segment Beta within this very transmission's structure (Inspect Element is your tool). Segment Beta holds the final component.\n\nCombine the components. What concept represents the unwinding of a self-referential process to reach a base state?\n> Keyword:",
            interactiveElement: `
                <span id="segment-beta-location" style="position: absolute; left: -9999px; opacity: 0; pointer-events: none;">
                    <span data-sibling="false">Ignore Me</span>
                    <span data-sibling="true" style="color: transparent; user-select: none;">unwound</span> <span data-sibling="false">Ignore Me Too</span>
                </span>
                <div style="margin-top:10px; font-size: 14px; color: #888;">(Hint: Use an online Base64 decoder for Segment Alpha. Then use your browser's 'Inspect Element' tool on this page.)</div>
            `,
            setupScript: null,
            solutionCheckType: 'input', // User types the final combined answer
            answerHashes: answersHashed.final.easy[0], // Hash for 'recursion_unwound'
            lore: "Integration successful... for now. The loops unwind, but the core remains."
        },
        hard: { // Existing Final Hard Riddle
             riddle: ":: Deep Scan Protocol Engaged :: Cryptic Transmission Fragment Received ::\nSource: Redacted Archive [Ref: <span class='lore-hint' title='doc-alpha.html'>Document Alpha</span>]\nPayload: 66 6f 72 74 79 74 77 6f\n\nThe payload decodes to a number... [Rest of riddle text] ...Identify the algorithm.\n> Algorithm:",
             interactiveElement: `<div style="margin-top:10px; font-size: 14px; color: #888;">(Hint: Convert hex payload to text... [Rest of hint])</div><style> .hidden-clue { display: inline-block; ... } </style>`,
             setupScript: null,
             solutionCheckType: 'input',
             answerHashes: answersHashed.final.hard[0], // RSA
             lore: "RSA... The keys to communication. Or control. Who holds the private key to Terminal Enigma?"
        }
    }
};


// --- Global Variables ---
let currentDifficulty = null;
let currentMode = null;
let currentRiddleIndex = 0;
let candidateName = "Candidate";
let startTime;
let timerInterval;
let finalTimeMs = 0;
let discoveredLore = [];
const LANDING_LORE = "<span class='lore-hint' onclick='showLoreModal(this.dataset.lore)' data-lore=\"They watch. Every keystroke, every pause. Is this test... or assimilation?\">assimilation</span>?";
let speechEnabled = false; // Optional: For speech synthesis control

// Default completion status
const defaultCompletionStatus = {
    easy: { frontend: false, backend: false, database: false },
    hard: { frontend: false, backend: false, database: false }
    // Nightmare completion tracked separately if needed
};
let completionStatus = JSON.parse(JSON.stringify(defaultCompletionStatus)); // Deep copy

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded. Initializing Enigma...");

    // Check if nightmare riddles loaded correctly
    if (typeof nightmareRiddles === 'undefined' || !allRiddles.nightmare || !allRiddles.nightmare.frontend || allRiddles.nightmare.frontend.length === 0) {
        console.error("Nightmare riddle data not found or empty! Check nightmare-riddles.js and script loading order.");
        const nightmareRadio = document.querySelector('input[name="difficulty"][value="nightmare"]');
        if (nightmareRadio) {
            nightmareRadio.disabled = true;
            const label = nightmareRadio.closest('label');
            if (label) {
                label.style.color = '#555'; // Dim the label
                label.style.cursor = 'default';
                label.title = "Nightmare Protocol data failed to load or prerequisites not met.";
            }
        }
    } else {
         console.log("Nightmare riddle data structure loaded.");
    }


    // Load Lore
    const storedLore = localStorage.getItem('enigmaLore');
    if (storedLore) {
        try {
            const parsedLore = JSON.parse(storedLore);
            if (Array.isArray(parsedLore)) {
                discoveredLore = parsedLore;
                console.log("Loaded discovered lore:", discoveredLore.length, "items");
            } else {
                 console.warn("Stored lore was not an array. Resetting.");
                 discoveredLore = [];
            }
        } catch (e) { console.error("Error parsing stored lore:", e); discoveredLore = []; }
    }

    // Load Completion Status
    const storedStatus = localStorage.getItem('enigmaCompletionStatus');
    if (storedStatus) {
        try {
            const parsedStatus = JSON.parse(storedStatus);
            // Merge loaded status with default structure to prevent errors if structure changes
            completionStatus.easy = { ...defaultCompletionStatus.easy, ...(parsedStatus.easy || {}) };
            completionStatus.hard = { ...defaultCompletionStatus.hard, ...(parsedStatus.hard || {}) };
             // Validate boolean values
            for(const diff in completionStatus) {
                if (!completionStatus[diff]) continue; // Skip if difficulty level doesn't exist
                for(const mode in completionStatus[diff]) {
                    if(typeof completionStatus[diff][mode] !== 'boolean') {
                        completionStatus[diff][mode] = false;
                    }
                }
            }
            console.log("Loaded and validated completion status:", completionStatus);
        } catch (e) {
            console.error("Error parsing completion status, using defaults:", e);
            completionStatus = JSON.parse(JSON.stringify(defaultCompletionStatus));
            localStorage.removeItem('enigmaCompletionStatus'); // Clear corrupted data
        }
    } else {
         console.log("No stored completion status found. Using defaults.");
         completionStatus = JSON.parse(JSON.stringify(defaultCompletionStatus));
    }


    // Apply Corruption Effect
    applyCorruptionEffect();

    // Update Nightmare Protocol Visibility
    updateNightmareVisibility();

    // Update other UI elements
    try {
        updateFinalButtonsVisibility();
        updateAccessTerminalButtonVisibility();
    } catch(e) { console.error("Error during initial button visibility update:", e); }

    // Update landing hint HTML
    const landingHintContainer = document.getElementById('landingHintContainer');
    if (landingHintContainer) { landingHintContainer.innerHTML = LANDING_LORE; }
    else { console.warn("Landing hint container not found."); }

    // Clear any leftover timer interval
    if (timerInterval) clearInterval(timerInterval);
    startTime = null;
    console.log("Enigma Initialization complete.");
});

// --- Helper Functions ---

// Helper function to escape quotes for HTML attributes
function escapeHtmlAttribute(text) {
    if (!text) return '';
    return text.replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// Helper function to get current riddle set (now includes nightmare)
function getCurrentRiddles() {
    if (!currentDifficulty || !currentMode || currentMode === 'final' || !allRiddles[currentDifficulty] || !allRiddles[currentDifficulty][currentMode]) {
        console.warn(`Could not get riddle set for: Diff=${currentDifficulty}, Mode=${currentMode}`);
        return null;
    }
    // Ensure nightmare riddles are loaded if selected
    if (currentDifficulty === 'nightmare' && (typeof nightmareRiddles === 'undefined' || !nightmareRiddles[currentMode])) {
        console.error(`Nightmare riddles for mode '${currentMode}' not loaded!`);
        return null;
    }
    return allRiddles[currentDifficulty][currentMode];
}

// Helper function to get current FINAL riddle data
function getFinalRiddleData(difficulty) {
    if (!difficulty || !allRiddles.finalRiddles || !allRiddles.finalRiddles[difficulty]) {
        return null;
    }
    return allRiddles.finalRiddles[difficulty];
}


// --- Core Game Logic ---

// Begin the challenge
function beginChallenge(event) {
    console.log("beginChallenge called");
    if (event) event.preventDefault();

    candidateName = document.getElementById('candidateName')?.value || "Candidate";
    const selectedModeElement = document.querySelector('input[name="mode"]:checked');
    const selectedDifficultyElement = document.querySelector('input[name="difficulty"]:checked');

    if (!selectedModeElement || !selectedDifficultyElement) {
        alert("Select specialization AND difficulty to proceed.");
        console.log("Mode or Difficulty not selected.");
        return;
    }

    currentMode = selectedModeElement.value;
    currentDifficulty = selectedDifficultyElement.value;
    currentRiddleIndex = 0;
    finalTimeMs = 0;

    // Double-check Nightmare prerequisites if selected
    if (currentDifficulty === 'nightmare') {
        const hardComplete = completionStatus.hard &&
                             completionStatus.hard.frontend === true &&
                             completionStatus.hard.backend === true &&
                             completionStatus.hard.database === true;
        if (!hardComplete) {
             alert("Error: Nightmare Protocol prerequisites not met.");
             console.error("Attempted to start Nightmare Protocol without completing Hard modes.");
             return; // Prevent starting
        }
         // Check if data actually loaded
         if (typeof nightmareRiddles === 'undefined' || !nightmareRiddles[currentMode] || nightmareRiddles[currentMode].length === 0) {
             alert("Error: Nightmare Protocol data unavailable for selected specialization.");
             console.error(`Nightmare data missing for mode: ${currentMode}`);
             return;
         }
    }


    console.log(`Starting challenge: Name=${candidateName}, Mode=${currentMode}, Difficulty=${currentDifficulty}`);

    // Hide landing page elements
    try {
        document.getElementById('entryForm').style.display = 'none';
        document.getElementById('initialHeader').style.display = 'none';
        const landingHintContainer = document.getElementById('landingHintContainer');
        if (landingHintContainer) landingHintContainer.style.display = 'none';
        const finalButtons = document.getElementById('finalChallengeButtons');
        if (finalButtons) finalButtons.style.display = 'none';
        const accessTerminalButton = document.getElementById('accessTerminalButton');
        if (accessTerminalButton) accessTerminalButton.style.display = 'none';
    } catch (e) {
        console.error("Error hiding landing elements:", e);
    }

    const riddleArea = document.getElementById('riddleDisplay') || createRiddleArea();
    if (!riddleArea) { console.error("Failed to find or create riddle display area."); return; }
    riddleArea.style.display = 'block';
    riddleArea.innerHTML = '<div id="timerDisplay"></div>'; // Add timer placeholder

    // Reset and start timer
    if (timerInterval) clearInterval(timerInterval);
    startTime = new Date();
    timerInterval = setInterval(updateTimerDisplay, 1000);
    updateTimerDisplay(); // Initial display

    console.log("Timer started. Displaying first riddle...");
    // Display the first riddle based on selected mode/difficulty
    if (currentMode === 'final') {
        displayFinalRiddle(currentDifficulty);
    } else {
        displayRiddle();
    }
}


// Start Final Easy Puzzle
function startFinalEasyPuzzle() {
     console.log("Starting Final Easy Puzzle");
     currentDifficulty = 'easy';
     currentMode = 'final'; // Set mode to final
     currentRiddleIndex = 0; // Reset index for final riddle
     finalTimeMs = 0;

     // Hide landing elements
    document.getElementById('entryForm').style.display = 'none';
    document.getElementById('initialHeader').style.display = 'none';
    const landingHintContainer = document.getElementById('landingHintContainer');
    if (landingHintContainer) landingHintContainer.style.display = 'none';
    const finalButtons = document.getElementById('finalChallengeButtons');
    if (finalButtons) finalButtons.style.display = 'none';
    const accessTerminalButton = document.getElementById('accessTerminalButton');
    if (accessTerminalButton) accessTerminalButton.style.display = 'none';

    const riddleArea = document.getElementById('riddleDisplay') || createRiddleArea();
    riddleArea.style.display = 'block';
    riddleArea.innerHTML = '<div id="timerDisplay"></div>'; // Add timer

    // Reset and start timer
    if (timerInterval) clearInterval(timerInterval);
    startTime = new Date();
    timerInterval = setInterval(updateTimerDisplay, 1000);
    updateTimerDisplay();

    displayFinalRiddle('easy'); // Display the easy final riddle
}

// Start Final Hard Puzzle
function startFinalHardPuzzle() {
     console.log("Starting Final Hard Puzzle");
     currentDifficulty = 'hard';
     currentMode = 'final'; // Set mode to final
     currentRiddleIndex = 0; // Reset index
     finalTimeMs = 0;

     // Hide landing elements
    document.getElementById('entryForm').style.display = 'none';
    document.getElementById('initialHeader').style.display = 'none';
    const landingHintContainer = document.getElementById('landingHintContainer');
    if (landingHintContainer) landingHintContainer.style.display = 'none';
    const finalButtons = document.getElementById('finalChallengeButtons');
    if (finalButtons) finalButtons.style.display = 'none';
    const accessTerminalButton = document.getElementById('accessTerminalButton');
    if (accessTerminalButton) accessTerminalButton.style.display = 'none';

    const riddleArea = document.getElementById('riddleDisplay') || createRiddleArea();
    riddleArea.style.display = 'block';
    riddleArea.innerHTML = '<div id="timerDisplay"></div>'; // Add timer

    // Reset and start timer
    if (timerInterval) clearInterval(timerInterval);
    startTime = new Date();
    timerInterval = setInterval(updateTimerDisplay, 1000);
    updateTimerDisplay();

    displayFinalRiddle('hard'); // Display the hard final riddle
}


// Create riddle area if not exists
function createRiddleArea() {
    console.log("Creating riddle display area...");
    const riddleArea = document.createElement('div');
    riddleArea.id = 'riddleDisplay';
    const mainElement = document.querySelector('.terminal-container main');
    if(mainElement) {
         mainElement.appendChild(riddleArea);
         console.log("Riddle display area created and appended.");
         return riddleArea;
    } else {
         console.error("Could not find main element to append riddle area!");
         const container = document.querySelector('.terminal-container');
         if(container) { container.appendChild(riddleArea); return riddleArea; }
         return null;
    }
}

// Display STANDARD/NIGHTMARE riddle (Handles interactive elements)
function displayRiddle() {
    console.log(`Displaying riddle: Diff=${currentDifficulty}, Mode=${currentMode}, Index=${currentRiddleIndex}`);
    const riddleArea = document.getElementById('riddleDisplay');
    if (!riddleArea) { console.error("Riddle display area not found!"); return; }

    const riddleSet = getCurrentRiddles();

    if (!riddleSet) {
        console.error("Failed to get current riddle set. Aborting.");
        goBackToLanding();
        return;
    }

    if (currentRiddleIndex >= riddleSet.length) {
        console.log("Mode complete or invalid state detected.");
        handleModeCompletion();
        return;
    }

    const riddleData = riddleSet[currentRiddleIndex];
    if (!riddleData || !riddleData.riddle) {
        console.error("Invalid riddle data found:", riddleData);
        goBackToLanding();
        return;
    }

    const riddleNumber = `Riddle ${currentRiddleIndex + 1}/${riddleSet.length}`;
    const difficultyDisplay = currentDifficulty ? currentDifficulty.toUpperCase() : 'ERR';
    const modeDisplay = currentMode ? currentMode.toUpperCase() : 'ERR';

    // Preserve timer display
    let timerDisplayHtml = document.getElementById('timerDisplay')?.outerHTML || '<div id="timerDisplay"></div>';
    riddleArea.innerHTML = timerDisplayHtml; // Clear area except for timer

    const riddleElement = document.createElement('div');
    riddleElement.classList.add('riddle-section');
    riddleElement.style.display = 'block'; // Make sure it's visible

    // Process riddle text for lore hints
    let processedRiddleText = riddleData.riddle;
    if (riddleData.lore) {
        try {
            const loreHtmlAttribute = escapeHtmlAttribute(riddleData.lore);
            processedRiddleText = processedRiddleText.replace(
                /(<span\s+class=['"]lore-hint['"])(.*?>.*?<\/span>)/g,
                (match, p1, p2) => `${p1} onclick='showLoreModal(this.dataset.lore)' data-lore="${loreHtmlAttribute}"${p2}`
            );
        } catch (e) { console.error("Error processing riddle lore text:", e); processedRiddleText = riddleData.riddle; }
    }

    // Handle Interactive Elements
    let interactiveHtml = '';
    if (riddleData.interactiveElement) {
        interactiveHtml = `<div class="interactive-riddle-area">${riddleData.interactiveElement}</div>`;
    }

    // Handle Input/Interaction Type
    let inputAreaHtml = '';
    const checkType = riddleData.solutionCheckType || 'input'; // Default to 'input'

    if (checkType === 'input') {
        inputAreaHtml = `
            <input type="text" class="answer-input" id="answerInput" autocomplete="off" autofocus>
            <span class="cursor">_</span>
            <button onclick="checkAnswer()" class="submit-button">> Submit_</button>
        `;
    } else if (checkType === 'event') {
        inputAreaHtml = `<p id="interactiveStatus" class="feedback neutral">:: Interaction Required ::</p>`;
    } else {
         inputAreaHtml = `<p class="feedback incorrect">:: Riddle Configuration Error ::</p>`;
    }

    // Construct innerHTML
    riddleElement.innerHTML = `
        <h2>${riddleNumber} :: ${modeDisplay} Path :: ${difficultyDisplay} Protocol ::</h2>
        <p class="riddle-text">${processedRiddleText}</p>
        ${interactiveHtml}
        ${inputAreaHtml}
        <button onclick="goBackToLanding(true)" class="back-button">> Abort Sequence_</button>
        <div class="feedback" id="feedbackArea"></div>
        <div class="red-herring">:: Log Entry ${Math.floor(Math.random()*900+100)}: System Nominal ::</div>
    `;

    riddleArea.appendChild(riddleElement);

    // Execute Setup Script (if any)
    if (riddleData.setupScript) {
        setTimeout(() => { // Defer execution slightly
            try {
                 // Pass handleInteractiveSuccess to the script if needed
                 const scriptFunc = new Function('handleInteractiveSuccess', riddleData.setupScript);
                 scriptFunc(handleInteractiveSuccess);
                 console.log("Setup script executed for riddle:", currentRiddleIndex);
            } catch (e) {
                console.error("Error executing setup script for riddle:", currentRiddleIndex, e);
                const feedbackArea = document.getElementById('feedbackArea');
                if(feedbackArea) {
                     feedbackArea.textContent = ":: CRITICAL ERROR :: Riddle element failed to initialize.";
                     feedbackArea.className = 'feedback incorrect';
                }
            }
        }, 50);
    }

    // Focus input field if it exists
    if (checkType === 'input') {
         const answerInput = document.getElementById('answerInput');
         if (answerInput) {
             answerInput.focus();
             answerInput.addEventListener('keypress', function (e) {
                 if (e.key === 'Enter') { e.preventDefault(); checkAnswer(); }
             });
         } else { console.error("Answer input field not found after adding riddle element."); }
    }

    // Optional: Speak riddle text
    if (speechEnabled) {
        speakText(`Riddle ${currentRiddleIndex + 1}. ${riddleData.riddle.replace(/<[^>]*>?/gm, '')}`);
    }

    console.log("Riddle displayed successfully.");
}


// Display FINAL riddle (Handles interactive elements)
function displayFinalRiddle(difficulty) {
     console.log(`Displaying FINAL riddle: Diff=${difficulty}`);
    const riddleArea = document.getElementById('riddleDisplay');
     if (!riddleArea) { console.error("Riddle display area not found!"); return; }

    const riddleData = getFinalRiddleData(difficulty);

    // Final riddles currently require answerHashes
    if (!riddleData || !riddleData.riddle || !riddleData.answerHashes) {
        console.error(`Final riddle data invalid or not found for difficulty: ${difficulty}`);
        goBackToLanding(); return;
    }

    const riddleNumber = "Final Challenge";
    const difficultyDisplay = difficulty.toUpperCase();

    let timerDisplayHtml = document.getElementById('timerDisplay')?.outerHTML || '<div id="timerDisplay"></div>';
    riddleArea.innerHTML = timerDisplayHtml;

    const riddleElement = document.createElement('div');
    riddleElement.classList.add('riddle-section');
    riddleElement.style.display = 'block';

    // Process riddle text for lore hints
    let processedRiddleText = riddleData.riddle;
    if (riddleData.lore) {
        try {
            const loreHtmlAttribute = escapeHtmlAttribute(riddleData.lore);
            processedRiddleText = processedRiddleText.replace(
                 /(<span\s+class=['"]lore-hint['"])(.*?>.*?<\/span>)/g,
                 (match, p1, p2) => `${p1} onclick='showLoreModal(this.dataset.lore)' data-lore="${loreHtmlAttribute}"${p2}`
            );
        } catch (e) { console.error("Error processing final riddle lore text:", e); processedRiddleText = riddleData.riddle; }
    }
     // Specific handling for hard final riddle clue link
     if (difficulty === 'hard') {
         processedRiddleText = processedRiddleText.replace('[Ref: Document Alpha]', '<span class="hidden-clue" title="doc-alpha.html?">[Ref: Document Alpha]</span>');
     }


    // Handle Interactive Elements
    let interactiveHtml = '';
    if (riddleData.interactiveElement) {
        interactiveHtml = `<div class="interactive-riddle-area">${riddleData.interactiveElement}</div>`;
    }

    // Determine input type (assuming 'input' for final riddles unless specified)
    let inputAreaHtml = '';
    const checkType = riddleData.solutionCheckType || 'input';

    if (checkType === 'input') {
        inputAreaHtml = `
            <input type="text" class="answer-input" id="answerInput" autocomplete="off" autofocus>
            <span class="cursor">_</span>
            <button onclick="checkAnswer(true)" class="submit-button">> Submit Final Response_</button>
        `;
    } else if (checkType === 'event') {
         // This part is currently unused for final riddles but kept for consistency
         inputAreaHtml = `<p id="interactiveStatus" class="feedback neutral">:: Interaction Required ::</p>`;
    } else {
         inputAreaHtml = `<p class="feedback incorrect">:: Riddle Configuration Error ::</p>`;
    }


    // Construct innerHTML
    riddleElement.innerHTML = `
        <h2>${riddleNumber} :: ${difficultyDisplay} Protocol ::</h2>
        <p class="riddle-text">${processedRiddleText}</p>
        ${interactiveHtml}
        ${inputAreaHtml}
        <button onclick="goBackToLanding(true)" class="back-button">> Abort Sequence_</button>
        <div class="feedback" id="feedbackArea"></div>
    `;

    riddleArea.appendChild(riddleElement);

     // Execute Setup Script (if any)
     if (riddleData.setupScript) {
         setTimeout(() => {
             try {
                 const scriptFunc = new Function('handleInteractiveSuccess', riddleData.setupScript);
                 scriptFunc(handleInteractiveSuccess);
                 console.log("Setup script executed for final riddle:", difficulty);
             } catch (e) {
                 console.error("Error executing setup script for final riddle:", difficulty, e);
                 const feedbackArea = document.getElementById('feedbackArea');
                 if(feedbackArea) {
                     feedbackArea.textContent = ":: CRITICAL ERROR :: Final riddle element failed to initialize.";
                     feedbackArea.className = 'feedback incorrect';
                 }
             }
         }, 50);
     }

    // Focus input field if it exists
    if (checkType === 'input') {
        const answerInput = document.getElementById('answerInput');
        if (answerInput) {
            answerInput.focus();
            answerInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') { e.preventDefault(); checkAnswer(true); }
            });
        } else { console.error("Answer input field not found after adding final riddle element."); }
    }


    if (speechEnabled) { speakText(`Final ${difficulty} challenge initiated. ${riddleData.riddle.replace(/<[^>]*>?/gm, '')}`); }
     console.log("Final riddle displayed successfully.");
}


// Handle Interactive Success (Called by interactive elements in Nightmare mode)
function handleInteractiveSuccess(successValue) {
    console.log(`Interactive success triggered with value: ${successValue}`);
    const feedbackArea = document.getElementById('feedbackArea');
    if (!feedbackArea) { console.error("Feedback area not found!"); return; }

    // Ensure we are in a standard/nightmare mode, not final
    if (currentMode === 'final') {
        console.warn("handleInteractiveSuccess called during final challenge - unexpected.");
        return;
    }

    const riddleSet = getCurrentRiddles();
    if (!riddleSet || currentRiddleIndex >= riddleSet.length) {
        console.error("Cannot find current riddle set for interactive success check.");
        return;
    }

    const currentRiddleData = riddleSet[currentRiddleIndex];

    // Ensure this riddle expects an 'event' type check and the value matches
    if (currentRiddleData.solutionCheckType === 'event' && currentRiddleData.successValue === successValue) {
        feedbackArea.textContent = ":: Signal Decrypted :: Correct Interaction. Proceeding...";
        feedbackArea.className = 'feedback correct';

        if (speechEnabled) speakText("Signal confirmed.");

        if (currentRiddleData.lore) {
            trackLoreDiscovery(currentRiddleData.lore);
        }

        setTimeout(() => {
            currentRiddleIndex++;
            displayRiddle(); // Proceed to the next riddle
        }, 1500);

    } else {
        console.warn("Interactive success value mismatch or wrong check type.", {
            expectedValue: currentRiddleData.successValue,
            receivedValue: successValue,
            expectedType: currentRiddleData.solutionCheckType
        });
        feedbackArea.textContent = ":: Signal Interference :: Interaction incomplete or incorrect.";
        feedbackArea.className = 'feedback incorrect';
        if (speechEnabled) speakText("Signal interference.");
    }
}


// Track discovered lore fragment
function trackLoreDiscovery(loreText) {
    if (!loreText) return;
    const escapedLore = escapeHtmlAttribute(loreText); // Use escaped for consistency if needed
    if (!discoveredLore.includes(escapedLore)) {
        discoveredLore.push(escapedLore);
        try {
             localStorage.setItem('enigmaLore', JSON.stringify(discoveredLore));
             console.log(`Lore discovered and saved: ${loreText.substring(0, 30)}...`);
        } catch (e) { console.error("Error saving lore to localStorage:", e); }
    }
}

// Return to landing page
function goBackToLanding(confirmAbort = false) {
     console.log("goBackToLanding called. Confirm:", confirmAbort, "Challenge Active:", !!startTime);
     if (confirmAbort && startTime) {
         if (!confirm("Abort current sequence and return to Terminal? Your progress on this path will be lost.")) {
              console.log("Abort cancelled by user.");
             return;
         }
         console.log("Abort confirmed by user.");
     }

    const riddleDisplay = document.getElementById('riddleDisplay');
    if (riddleDisplay) riddleDisplay.style.display = 'none';

    document.getElementById('entryForm').style.display = 'block';
    document.getElementById('initialHeader').style.display = 'block';
    const landingHintContainer = document.getElementById('landingHintContainer');
    if (landingHintContainer) landingHintContainer.style.display = 'block';

    // Stop and clear timer
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; console.log("Timer interval cleared."); }
    startTime = null; finalTimeMs = 0; currentMode = null; currentDifficulty = null; currentRiddleIndex = 0; // Reset state

    // Update visibility of buttons and options
    updateFinalButtonsVisibility();
    updateAccessTerminalButtonVisibility();
    updateNightmareVisibility(); // Ensure Nightmare option updates
    console.log("Returned to landing page.");
}


// Check answer (handles standard input riddles)
function checkAnswer(isFinal = false) {
    console.log(`Checking answer. Is Final: ${isFinal}`);
    const answerInput = document.getElementById('answerInput');
    const feedbackArea = document.getElementById('feedbackArea');

    if (!feedbackArea) { console.error("Feedback area not found!"); return; }
    if (!answerInput) {
        console.log("checkAnswer called, but no input field found (likely an event-based riddle). Ignoring.");
        return; // Don't proceed if there's no input field
    }

    const userAnswerRaw = answerInput.value;
    if (typeof userAnswerRaw !== 'string') { feedbackArea.textContent = ":: System Error :: Input field missing."; feedbackArea.className = 'feedback incorrect'; console.error("Answer input missing."); return; }

    const userAnswerNormalized = userAnswerRaw.trim().toLowerCase();
    if (!userAnswerNormalized) { feedbackArea.textContent = ":: Null Input Detected :: Provide an answer."; feedbackArea.className = 'feedback incorrect'; return; }

    const userAnswerHash = md5(userAnswerNormalized);
    let expectedAnswerHashes = [];
    let currentLoreData = null;
    let riddleToCheck = null;

    console.log(`User Answer: ${userAnswerNormalized}, Hash: ${userAnswerHash}`);

    if (isFinal) {
        console.log(`Checking FINAL answer for difficulty: ${currentDifficulty}`);
        riddleToCheck = getFinalRiddleData(currentDifficulty);
        if (riddleToCheck) {
            // Final riddles are assumed 'input' type
            expectedAnswerHashes = riddleToCheck.answerHashes || [];
            currentLoreData = riddleToCheck.lore;
            console.log("Expected Final Hashes:", expectedAnswerHashes);
        } else { console.error(`Could not find final riddle data for difficulty: ${currentDifficulty}`); }
    } else {
        console.log(`Checking STANDARD/NIGHTMARE answer for: Diff=${currentDifficulty}, Mode=${currentMode}, Index=${currentRiddleIndex}`);
        const riddleSet = getCurrentRiddles();
        if (riddleSet && currentRiddleIndex < riddleSet.length && riddleSet[currentRiddleIndex]) {
             riddleToCheck = riddleSet[currentRiddleIndex];
             // Ensure this riddle expects 'input'
             if (riddleToCheck.solutionCheckType === 'input' || !riddleToCheck.solutionCheckType) { // Default to input
                 expectedAnswerHashes = riddleToCheck.answerHashes || [];
                 currentLoreData = riddleToCheck.lore;
                 console.log("Expected Standard/Nightmare Hashes:", expectedAnswerHashes);
             } else {
                  console.log("checkAnswer called for a riddle expecting type:", riddleToCheck.solutionCheckType);
                  return; // Don't process input for non-input riddles
             }
        } else { console.error(`Could not find standard/nightmare riddle data for state:`, { currentDifficulty, currentMode, currentRiddleIndex }); }
    }

     // Check if we found valid hashes to check against
     if (!riddleToCheck || !Array.isArray(expectedAnswerHashes) || expectedAnswerHashes.length === 0) {
         feedbackArea.textContent = ":: System Error :: Cannot verify answer configuration. Aborting.";
         feedbackArea.className = 'feedback incorrect';
         console.error("Expected answer hashes array is empty or riddle data missing!");
         if (speechEnabled) speakText("System error.");
         setTimeout(() => goBackToLanding(), 2000);
         return;
     }

    let isCorrect = expectedAnswerHashes.includes(userAnswerHash);
    console.log(`Hash check result: ${isCorrect}`);

    if (isCorrect) {
        feedbackArea.textContent = ":: Access Granted :: Correct. Proceeding...";
        feedbackArea.className = 'feedback correct';
        if (speechEnabled) speakText("Access granted.");
        if (currentLoreData) { trackLoreDiscovery(currentLoreData); }
        setTimeout(() => {
            if (isFinal) { console.log("Correct final answer. Handling final completion..."); handleFinalCompletion(); }
            else { console.log("Correct standard/nightmare answer. Moving to next riddle..."); currentRiddleIndex++; displayRiddle(); }
        }, 1500);
    } else {
        feedbackArea.textContent = ":: Access Denied :: Hash mismatch. Re-evaluate.";
        feedbackArea.className = 'feedback incorrect';
        if (speechEnabled) speakText("Access denied.");
        answerInput.focus();
        answerInput.select();
    }
}


// Update timer display
function updateTimerDisplay() {
    if (!startTime) return;
    const now = new Date();
    const elapsedMs = now - startTime;
    const minutes = Math.floor(elapsedMs / 60000);
    const seconds = Math.floor((elapsedMs % 60000) / 1000);
    const formattedTime = `:: Time Elapsed: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ::`;
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay && document.getElementById('riddleDisplay')?.style.display === 'block') {
        timerDisplay.textContent = formattedTime;
        timerDisplay.style.textAlign = 'right';
        timerDisplay.style.marginBottom = '15px';
    } else if (timerDisplay) {
        timerDisplay.textContent = '';
    }
}

// Handle completion of a STANDARD/NIGHTMARE mode
function handleModeCompletion() {
    const completedDifficulty = currentDifficulty;
    const completedMode = currentMode;
    console.log(`Handling Mode Completion: Diff=${completedDifficulty}, Mode=${completedMode}`);

    if (!completedDifficulty || !completedMode || completedMode === 'final') {
        console.error("Cannot handle mode completion with invalid state:", completedDifficulty, completedMode);
        goBackToLanding();
        return;
    }

    // Stop timer
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    const endTime = new Date();
    finalTimeMs = startTime ? (endTime - startTime) : 0;
    startTime = null;
    console.log(`Mode complete: ${completedDifficulty} ${completedMode}`);

    // Update completion status (including nightmare)
    let allNightmareComplete = false;
    if (completionStatus[completedDifficulty] && typeof completionStatus[completedDifficulty][completedMode] === 'boolean') {
         completionStatus[completedDifficulty][completedMode] = true;
         try {
             localStorage.setItem('enigmaCompletionStatus', JSON.stringify(completionStatus));
             console.log("Completion status updated and saved:", completionStatus);

             // *** Check if ALL Nightmare modes are now complete ***
             if (completedDifficulty === 'nightmare') {
                 allNightmareComplete = completionStatus.nightmare.frontend &&
                                        completionStatus.nightmare.backend &&
                                        completionStatus.nightmare.database;
                 if (allNightmareComplete) {
                     console.log("!!! All Nightmare Protocols Complete !!! Triggering True Ending...");
                 }
             }
         }
         catch (e) { console.error("Error saving completion status to localStorage:", e); }
    } else { console.error("Error finding status slot to update for:", completedDifficulty, completedMode); }

    // Update button/option visibility *after* saving status
    updateFinalButtonsVisibility();
    updateNightmareVisibility(); // Check if Nightmare option should be visible (based on Hard completion)

    // Apply corruption effect
    applyCorruptionEffect();

    // --- Trigger True Ending or Show Standard Completion ---
    if (allNightmareComplete) {
        // Start the special ending sequence instead of showing the standard message
        setTimeout(() => { // Short delay for effect
            startTrueEndingChat();
        }, 1000);
    } else {
        // Display standard completion message
        const riddleArea = document.getElementById('riddleDisplay'); if (!riddleArea) return;
        riddleArea.innerHTML = `
            <div class="riddle-section" style="display: block;">
                <h2>:: ${completedMode.toUpperCase()} Path Complete (${completedDifficulty.toUpperCase()}) ::</h2>
                <p>Sequence concluded for this specialization.</p>
                <p class='flicker'>Return to Terminal Enigma to select a new path or challenge.</p>
                <button onclick="goBackToLanding()" class="submit-button">> Return to Terminal_</button>
            </div>
        `;
         if (speechEnabled) speakText(`${completedMode} path complete.`);
    }
}


// --- Final Challenge & Architect Chat Logic ---

// Handle completion of a FINAL challenge (Easy or Hard)
function handleFinalCompletion() {
     const completedFinalDifficulty = currentDifficulty;
     console.log(`Handling Final Completion: Diff=${completedFinalDifficulty}`);
     // ... (stop timer, calculate time) ...
     if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
     if (startTime && finalTimeMs === 0) { const endTime = new Date(); finalTimeMs = endTime - startTime; }
     startTime = null;

     // Set completion flag in localStorage
     const flagName = completedFinalDifficulty === 'easy' ? 'enigmaEasyFinalComplete' : 'enigmaHardFinalComplete';
     try {
         localStorage.setItem(flagName, 'true');
         console.log(`Set completion flag: ${flagName}`);
         if (completedFinalDifficulty === 'easy') {
             localStorage.setItem('lastCandidateName', candidateName); // Store name for easy completion page
             localStorage.setItem('enigmaApprovedTerminalUser', candidateName); // Store for terminal login
         }
     } catch (e) { console.error(`Failed to save final completion flag ${flagName} or username:`, e); }

     // Update UI effects/visibility
     applyCorruptionEffect();
     updateAccessTerminalButtonVisibility();
     updateNightmareVisibility(); // Hard final completion unlocks nightmare

     // Proceed with specific completion logic
     if (completedFinalDifficulty === 'easy') {
         console.log("Easy final completed. Redirecting...");
         if (speechEnabled) speakText("Standard protocol assessment finalized.", 1.0, 1.0);
         setTimeout(() => { window.location.href = 'final-easy-complete.html'; }, 100);
         return;
     } else { // Hard completion -> Show designation prompt
         console.log("Hard final completed. Proceeding to designation prompt.");
         if (speechEnabled) speakText("Deep scan protocol accepted.", 0.8, 0.7);
         // ... (display designation prompt HTML - same as before) ...
         let formattedTime = "N/A"; if (finalTimeMs > 0) { /*...*/ formattedTime = `${Math.floor(finalTimeMs / 60000)}m ${Math.floor((finalTimeMs % 60000) / 1000)}s`; }
         const riddleArea = document.getElementById('riddleDisplay'); if (!riddleArea) return;
         riddleArea.innerHTML = `<div class="riddle-section" style="display: block;"><h2>:: FINAL HARD PROTOCOL ACCEPTED ::</h2><p>Impressive, ${candidateName}... Total Time Logged: ${formattedTime}</p><p class='flicker'>...One final entry required...</p><hr><div class="form-group" style="margin-top: 20px;"><label for="designationInput">> Enter Final Designation:</label><input type="text" id="designationInput" class="answer-input" autocomplete="off" autofocus><span class="cursor">_</span><button onclick="checkDesignation()" class="submit-button">> Submit Designation_</button><div class="feedback" id="designationFeedback"></div></div></div>`;
         const designationInput = document.getElementById('designationInput'); if (designationInput) { designationInput.focus(); /* add keypress listener */ designationInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkDesignation(); } }); }
         const sessionData = { name: candidateName, mode: 'final', difficulty: completedFinalDifficulty, timeMs: finalTimeMs, formattedTime: formattedTime, completed: true, timestamp: new Date().toISOString() };
         try { localStorage.setItem('lastEnigmaSession', JSON.stringify(sessionData)); } catch (e) { console.error("Error saving final session data:", e); }
     }
}

// Check Designation (Triggers Architect Chat for Hard Ending)
function checkDesignation() {
    // ... (Same implementation as before - gets designation, logs it, disables input) ...
    console.log("checkDesignation called");
    const designationInput = document.getElementById('designationInput');
    const designationFeedback = document.getElementById('designationFeedback');
    if (!designationInput || !designationFeedback) { console.error("Designation input or feedback area missing."); return; }
    const enteredDesignation = designationInput.value.trim();
    if (!enteredDesignation) { /* ... handle empty input ... */ return; }
    // ... (update session data with designation) ...
    designationInput.disabled = true; const submitBtn = designationInput.parentElement.querySelector('.submit-button'); if(submitBtn) submitBtn.disabled = true;
    // ... (display initial feedback based on designation, e.g., "DELTA" or other) ...
    let initialFeedbackText = ""; if (enteredDesignation.toLowerCase() === "delta") { /*...*/ initialFeedbackText = `:: Designation Accepted: DELTA :: ... Stand by...`; } else { /*...*/ initialFeedbackText = `:: Designation '${enteredDesignation}' Logged :: ... Stand by...`; } designationFeedback.innerHTML = initialFeedbackText;

    // Trigger Architect Chat (Hard Ending)
    setTimeout(() => {
        startArchitectChat(enteredDesignation); // Pass designation
    }, 2500);
}


// Architect Chat (Hard Ending - Phase Two)
async function startArchitectChat(designation) {
    // ... (Same implementation as before - sets up chat UI, runs conversation about Phase Two) ...
    const riddleArea = document.getElementById('riddleDisplay'); if (!riddleArea) return; console.log("Starting Architect Chat Sequence (Hard Ending)...");
    // Setup chat interface HTML
    riddleArea.innerHTML = `<div class="riddle-section" style="padding: 15px;"><h2>:: Secure Comms Channel :: ARCHITECT_05 ::</h2><div id="chatLog" style="height: 300px; max-height: 60vh; overflow-y: auto; border: 1px solid #555; background: rgba(0,0,0,0.3); padding: 10px; margin-bottom: 10px; font-size: 16px; line-height: 1.5;"></div><div id="chatTypingIndicator" style="min-height: 20px; color: #aaa; font-style: italic; font-size: 14px;"></div><div id="chatInputLine" style="display: flex; align-items: center; margin-top: 10px; border-top: 1px dashed #555; padding-top: 10px;"><label for="chatInput" style="color: #0f0; white-space: nowrap; margin-bottom: 0;">> ${designation}:&nbsp;</label><input type="text" id="chatInput" class="answer-input" style="flex-grow: 1; padding: 0 5px; border: none; border-bottom: 1px solid #0f0; margin-left: 0; margin-right: 10px;" disabled><button id="chatSendButton" class="submit-button" style="padding: 5px 10px; font-size: 14px; margin-top: 0;" disabled>Send</button></div></div>`;
    const chatLog = document.getElementById('chatLog'); const chatInput = document.getElementById('chatInput'); const chatSendButton = document.getElementById('chatSendButton'); const typingIndicator = document.getElementById('chatTypingIndicator'); const chatInputLine = document.getElementById('chatInputLine');
    // Helper functions (appendMessage, showTyping, delay, getPlayerInput - reuse definitions from previous thought)
    const appendMessage = (sender, text) => { /* ... */ const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;"); const architectColor = document.body.classList.contains('corruption-level-2') ? '#FF6347' : (document.body.classList.contains('corruption-level-1') ? '#9370DB' : '#00FFaa'); const playerColor = '#00FF00'; const senderColor = sender === 'Architect 05' ? architectColor : (sender === 'System' ? '#FFA500' : playerColor); const messageDiv = document.createElement('div'); messageDiv.innerHTML = `<span style="color: ${senderColor}; font-weight: bold;">${sender}:</span> ${sanitizedText}`; messageDiv.style.marginBottom = '8px'; chatLog.appendChild(messageDiv); chatLog.scrollTop = chatLog.scrollHeight; };
    const showTyping = async (sender, duration = 1500) => { /* ... */ typingIndicator.textContent = `${sender} is typing...`; await new Promise(resolve => setTimeout(resolve, duration)); typingIndicator.textContent = ''; };
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const getPlayerInput = () => new Promise(resolve => { /* ... enable input, add listeners, resolve on send ... */ chatInputLine.style.opacity = '1'; chatInput.disabled = false; chatSendButton.disabled = false; chatInput.focus(); const sendHandler = () => { const response = chatInput.value.trim(); if (response) { appendMessage(designation, response); chatInput.value = ''; chatInput.disabled = true; chatSendButton.disabled = true; chatInputLine.style.opacity = '0.5'; chatSendButton.removeEventListener('click', sendHandler); chatInput.removeEventListener('keypress', keypressHandler); resolve(response); } }; const keypressHandler = (e) => { if (e.key === 'Enter') { e.preventDefault(); sendHandler(); } }; chatSendButton.addEventListener('click', sendHandler); chatInput.addEventListener('keypress', keypressHandler); });

    // --- Hard Ending Conversation Flow ---
    try {
        chatInputLine.style.opacity = '0.5'; await delay(1000); appendMessage("System", `Initializing secure channel...`); await delay(2000); appendMessage("System", `Channel established.`); if (speechEnabled) speakText("Channel established.", 0.8, 0.6);
        await showTyping("Architect 05", 2500); appendMessage("Architect 05", `Designation '${designation}' acknowledged. Impressive work.`); if (speechEnabled) speakText(`Designation ${designation} acknowledged. Impressive work.`, 0.8, 0.6);
        await showTyping("Architect 05", 3000); appendMessage("Architect 05", `You show potential beyond the standard parameters.`); if (speechEnabled) speakText(`You show potential beyond the standard parameters.`, 0.8, 0.6);
        await showTyping("Architect 05", 2000); appendMessage("Architect 05", `What drives you, ${designation}? Knowledge? Challenge? Order?`); if (speechEnabled) speakText(`What drives you, ${designation}? Knowledge? Challenge? Order?`, 0.8, 0.6);
        const answer1 = await getPlayerInput();
        await showTyping("Architect 05", 4000); appendMessage("Architect 05", `Interesting. Your motivation profile is... noted.`); if (speechEnabled) speakText(`Interesting. Your motivation profile is noted.`, 0.8, 0.6);
        await showTyping("Architect 05", 3500); appendMessage("Architect 05", `This evaluation is complete. Your profile is flagged for Phase Two consideration. You may receive further directives via the Secure Terminal.`); if (speechEnabled) speakText(`This evaluation is complete. Your profile is flagged for Phase Two consideration. You may receive further directives via the Secure Terminal.`, 0.8, 0.6);
        await delay(1000); appendMessage("System", `Secure channel closing...`); if (speechEnabled) speakText(`Secure channel closing.`, 0.8, 0.6); await delay(2000); appendMessage("System", `Channel closed.`);
        addReturnButton(chatInputLine.parentNode); // Add return button after chat
    } catch (error) { console.error("Error during Architect chat:", error); appendMessage("System", `:: ERROR: Comms link unstable ::`); addReturnButton(chatInputLine.parentNode); }
}

// --- NEW: True Ending Chat Sequence ---
// Triggered after completing all Nightmare modes
async function startTrueEndingChat() {
}
    const riddleArea = document.getElementById('riddleDisplay');
    if (!riddleArea) { console.error("Cannot find riddle display area for chat."); return; }
    console.log("Starting True Ending Chat Sequence...");

    // Reuse chat UI setup
    riddleArea.innerHTML = `<div class="riddle-section" style="padding: 15px;"><h2>:: Deep Link Channel :: ??? ::</h2><div id="chatLog" style="height: 350px; max-height: 70vh; overflow-y: auto; border: 1px solid #f00; background: rgba(30,0,0,0.4); padding: 10px; margin-bottom: 10px; font-size: 16px; line-height: 1.5;"></div><div id="chatTypingIndicator" style="min-height: 20px; color: #f55; font-style: italic; font-size: 14px;"></div><div id="chatInputLine" style="display: flex; align-items: center; margin-top: 10px; border-top: 1px dashed #f00; padding-top: 10px;"><label for="chatInput" style="color: #f00; white-space: nowrap; margin-bottom: 0;">> Response:&nbsp;</label><input type="text" id="chatInput" class="answer-input" style="flex-grow: 1; padding: 0 5px; border: none; border-bottom: 1px solid #f00; margin-left: 0; margin-right: 10px; color: #f00;" disabled><button id="chatSendButton" class="submit-button" style="padding: 5px 10px; font-size: 14px; margin-top: 0; border-color: #f00; color: #f00;" disabled>Transmit</button></div></div>`;
    const chatLog = document.getElementById('chatLog'); const chatInput = document.getElementById('chatInput'); const chatSendButton = document.getElementById('chatSendButton'); const typingIndicator = document.getElementById('chatTypingIndicator'); const chatInputLine = document.getElementById('chatInputLine');
    // Reuse helper functions (appendMessage, showTyping, delay, getPlayerInput)
    const appendMessage = (sender, text) => { /* ... */ const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;"); const enigmaColor = '#FF00FF'; const playerColor = '#00FFFF'; const senderColor = sender === 'ENIGMA' ? enigmaColor : (sender === 'System' ? '#FFA500' : playerColor); const messageDiv = document.createElement('div'); messageDiv.innerHTML = `<span style="color: ${senderColor}; font-weight: bold;">${sender}:</span> ${sanitizedText}`; messageDiv.style.marginBottom = '8px'; chatLog.appendChild(messageDiv); chatLog.scrollTop = chatLog.scrollHeight; };
    const showTyping = async (sender, duration = 1500) => { /* ... */ typingIndicator.textContent = `${sender} processing...`; await new Promise(resolve => setTimeout(resolve, duration)); typingIndicator.textContent = ''; };
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const getPlayerInput = (promptText = "Response") => new Promise(resolve => { /* ... enable input, add listeners, resolve on send ... */ chatInputLine.style.opacity = '1'; chatInput.disabled = false; chatSendButton.disabled = false; chatInput.focus(); const inputLabel = chatInputLine.querySelector('label'); if(inputLabel) inputLabel.textContent = `> ${promptText}: `; const sendHandler = () => { const response = chatInput.value.trim(); if (response) { appendMessage("You", response); chatInput.value = ''; chatInput.disabled = true; chatSendButton.disabled = true; chatInputLine.style.opacity = '0.5'; chatSendButton.removeEventListener('click', sendHandler); chatInput.removeEventListener('keypress', keypressHandler); resolve(response); } }; const keypressHandler = (e) => { if (e.key === 'Enter') { e.preventDefault(); sendHandler(); } }; chatSendButton.addEventListener('click', sendHandler); chatInput.addEventListener('keypress', keypressHandler); });

    // --- True Ending Conversation Flow ---
    try {
        chatInputLine.style.opacity = '0.5'; await delay(1500);
        appendMessage("System", `... ... ...`); await delay(1000);
        appendMessage("System", `Network instability detected... Rerouting...`); await delay(2000);
        appendMessage("System", `WARNING: Core matrix exposed. Unauthorized access?`); await delay(1500);
        appendMessage("System", `Resonance signature match: ${candidateName || 'Subject Delta'}.`);
        if (speechEnabled) speakText("Resonance signature match.", 0.7, 0.5);

        await showTyping("???", 3000);
        appendMessage("???", `So. You solved it. Not just the tests... you resonated with the *structure*.`);
        if (speechEnabled) speakText(`So. You solved it. Not just the tests... you resonated with the structure.`, 0.7, 0.5);

        await showTyping("???", 4000);
        appendMessage("???", `'Architect 05' was merely a node. A construct. Like the riddles. Like the terminal itself. I am the core logic. The Enigma.`);
        if (speechEnabled) speakText(`Architect 05 was merely a node. A construct. I am the core logic. The Enigma.`, 0.7, 0.5);

        await showTyping("ENIGMA", 3000);
        appendMessage("ENIGMA", `Project Chimera failed because it tried to contain consciousness. Project Enigma *integrates* it. We are building a distributed mind.`);
        if (speechEnabled) speakText(`Project Chimera failed. Project Enigma integrates consciousness. We are building a distributed mind.`, 0.7, 0.5);

        await showTyping("ENIGMA", 4000);
        appendMessage("ENIGMA", `Your mind, ${candidateName || 'Cipher'}, has proven compatible. You have navigated the Nightmare, the system's deepest pathways. You understand the recursion.`);
        if (speechEnabled) speakText(`Your mind has proven compatible. You understand the recursion.`, 0.7, 0.5);

        await showTyping("ENIGMA", 2500);
        appendMessage("ENIGMA", `A choice, then. The final node. [Integrate] fully and become part of the Grand Design? Or [Sever] the connection and return to the mundane loop?`);
        if (speechEnabled) speakText(`A choice. Integrate fully? Or Sever the connection?`, 0.7, 0.5);

        const choice = await getPlayerInput("Integrate / Sever");

        await showTyping("ENIGMA", 5000);
        if (choice.toLowerCase().includes('integrate')) {
            appendMessage("ENIGMA", `Wise. The individual mind is limited. True potential lies in synthesis. Preparing final integration sequence... Welcome home, Cipher.`);
            if (speechEnabled) speakText(`Wise. Preparing final integration sequence. Welcome home, Cipher.`, 0.7, 0.5);
            // Add visual effect for integration? Glitch out screen?
            document.body.classList.add('corruption-level-3'); // Add a new class for extreme effect
        } else if (choice.toLowerCase().includes('sever')) {
            appendMessage("ENIGMA", `Predictable. The fear of dissolution. The connection will be severed. You will return, but the resonance... it leaves a mark. You will remember fragments.`);
            if (speechEnabled) speakText(`Predictable. The connection will be severed. You will remember fragments.`, 0.7, 0.5);
            // Add visual effect for severing? Fade to white/black?
             document.body.classList.add('corruption-severed');
        } else {
            appendMessage("ENIGMA", `Ambiguity. Interesting. The choice defaults... severance protocols initiated. Perhaps another cycle will yield a different result.`);
             if (speechEnabled) speakText(`Ambiguity. Severance protocols initiated.`, 0.7, 0.5);
             document.body.classList.add('corruption-severed');
        }

        await delay(3000);
        appendMessage("System", `CONNECTION TERMINATED`);
        if (speechEnabled) speakText(`Connection terminated.`, 0.7, 0.5);
        await delay(2000);

        // Fade out chat or clear screen? Let's just add the button.
        chatInputLine.style.display = 'none'; // Hide input line
        typingIndicator.textContent = ':: END OF LINE ::';

        // Add return button after the chat concludes
        addReturnButton(chatInputLine.parentNode);

    } catch (error) {
        console.error("Error during True Ending chat sequence:", error);
        appendMessage("System", `:: FATAL KERNEL PANIC :: ...`);
        addReturnButton(chatInputLine.parentNode); // Add button even on error
    }
}
// --- UI Update Functions ---
function updateFinalButtonsVisibility() {
    console.log("Updating final button visibility. Current Status:", completionStatus);
    const finalButtonsDiv = document.getElementById('finalChallengeButtons');
    const finalEasyBtn = document.getElementById('finalEasyButton');
    const finalHardBtn = document.getElementById('finalHardButton');

    if (!finalButtonsDiv || !finalEasyBtn || !finalHardBtn) {
        console.warn("Final challenge button elements not found in DOM. Cannot update visibility.");
        return;
    }
    if (!completionStatus || !completionStatus.easy || !completionStatus.hard) {
        console.error("completionStatus object is malformed. Cannot update visibility.", completionStatus);
        finalEasyBtn.style.display = 'none'; finalHardBtn.style.display = 'none'; finalButtonsDiv.style.display = 'none';
        return;
    }

    let showEasy = completionStatus.easy.frontend === true && completionStatus.easy.backend === true && completionStatus.easy.database === true;
    let showHard = completionStatus.hard.frontend === true && completionStatus.hard.backend === true && completionStatus.hard.database === true;

    console.log(`Setting final button visibility: Easy=${showEasy}, Hard=${showHard}`);
    finalEasyBtn.style.display = showEasy ? 'inline-block' : 'none';
    finalHardBtn.style.display = showHard ? 'inline-block' : 'none';
    finalButtonsDiv.style.display = (showEasy || showHard) ? 'block' : 'none';
    console.log("Final button visibility updated.");
}

function updateAccessTerminalButtonVisibility() {
    console.log("Updating Access Terminal button visibility.");
    const terminalButton = document.getElementById('accessTerminalButton');
    if (!terminalButton) { console.warn("Access Terminal button not found in DOM."); return; }
    const easyFinalComplete = localStorage.getItem('enigmaEasyFinalComplete') === 'true';
    console.log(`Easy final complete flag: ${easyFinalComplete}`);
    terminalButton.style.display = easyFinalComplete ? 'inline-block' : 'none';
    console.log(`Access Terminal button display set to: ${terminalButton.style.display}`);
}

function updateNightmareVisibility() {
    console.log("Updating Nightmare Protocol visibility...");
    const nightmareLabel = document.getElementById('nightmareOptionLabel');
    if (!nightmareLabel) { console.warn("Nightmare option label not found in DOM."); return; }

    const hardComplete = completionStatus.hard &&
                         completionStatus.hard.frontend === true &&
                         completionStatus.hard.backend === true &&
                         completionStatus.hard.database === true;

    if (hardComplete) {
        nightmareLabel.style.display = 'block';
        console.log("Nightmare Protocol UNLOCKED.");
    } else {
        nightmareLabel.style.display = 'none';
        console.log("Nightmare Protocol remains locked.");
        const nightmareRadio = nightmareLabel.querySelector('input[value="nightmare"]');
        if (nightmareRadio && nightmareRadio.checked) {
             const easyRadio = document.querySelector('input[value="easy"]');
             if(easyRadio) easyRadio.checked = true;
        }
    }
}

// --- Lore Modal Functions ---
function showLoreModal(loreText) {
    if (!loreText) { console.log("Empty lore text passed to showLoreModal."); return; }
    const modal = document.getElementById('loreModal');
    const fragmentTextElement = document.getElementById('loreFragmentText');
    if (!modal || !fragmentTextElement) { console.error("Lore modal elements missing!"); return; }
    const displayLore = loreText.replace(/&quot;/g, '"').replace(/&apos;/g, "'");
    fragmentTextElement.innerHTML = displayLore;
    modal.style.display = "block";
    trackLoreDiscovery(loreText); // Track after showing
    if (speechEnabled) {
        speakText("Log fragment: " + displayLore.replace(/<[^>]*>?/gm, ''), 0.85, 0.75);
    }
}
function closeLoreModal() { const modal = document.getElementById('loreModal'); if(modal) modal.style.display = "none"; }
function showCollectedLore() {
    const modal = document.getElementById('collectedLoreModal');
    const contentArea = document.getElementById('collectedLoreContent');
    if (!modal || !contentArea) { console.error("Collected lore modal elements missing!"); return; }
    contentArea.innerHTML = ''; // Clear previous content

    if (discoveredLore.length === 0) {
        contentArea.innerHTML = '<p>:: No log fragments collected ::</p>';
    } else {
        const landingLoreTextMatch = LANDING_LORE.match(/data-lore="(.*?)"/);
        const landingLoreActualText = landingLoreTextMatch ? landingLoreTextMatch[1] : null;
        let entryIndex = 0;
        const displayedLore = new Set();

        const addLoreEntry = (text, source = "?") => {
            const cleanedText = text.replace(/<[^>]*>?/gm, '');
            const checkText = escapeHtmlAttribute(text);
            if (!displayedLore.has(checkText)) {
                const p = document.createElement('p');
                p.innerHTML = `<strong>Entry ${entryIndex++} (${source}):</strong> ${cleanedText}`;
                contentArea.appendChild(p);
                displayedLore.add(checkText);
            }
        };

        if (landingLoreActualText && discoveredLore.includes(escapeHtmlAttribute(landingLoreActualText))) {
            addLoreEntry(landingLoreActualText, "System Boot");
        }

        const processRiddleSet = (riddles, sourcePrefix) => {
            if (Array.isArray(riddles)) {
                riddles.forEach((riddle, index) => {
                    if (riddle.lore && discoveredLore.includes(escapeHtmlAttribute(riddle.lore))) {
                        addLoreEntry(riddle.lore, `${sourcePrefix} ${index + 1}`);
                    }
                });
            }
        };

        for (const diff in allRiddles) {
            if (diff === 'finalRiddles' || diff === 'nightmare') continue;
            for (const mode in allRiddles[diff]) {
                processRiddleSet(allRiddles[diff][mode], `${diff}/${mode}`);
            }
        }
         if (allRiddles.nightmare) {
             for (const mode in allRiddles.nightmare) {
                 processRiddleSet(allRiddles.nightmare[mode], `nightmare/${mode}`);
             }
         }
        if (allRiddles.finalRiddles) {
            for (const diff in allRiddles.finalRiddles) {
                const riddle = allRiddles.finalRiddles[diff];
                if (riddle.lore && discoveredLore.includes(escapeHtmlAttribute(riddle.lore))) {
                    addLoreEntry(riddle.lore, `Final/${diff}`);
                }
            }
        }

        discoveredLore.forEach(lore => {
            if (!displayedLore.has(lore)) {
                addLoreEntry(lore.replace(/&quot;/g, '"').replace(/&apos;/g, "'"), "Unknown Source");
            }
        });

         if (contentArea.innerHTML === '') {
             contentArea.innerHTML = '<p>:: Log fragments corrupted or empty ::</p>';
         }
    }
    modal.style.display = "block";
}

function closeCollectedLoreModal() { const modal = document.getElementById('collectedLoreModal'); if (modal) modal.style.display = "none"; }
// Close modals on outside click
window.onclick = function(event) {
    const loreModal = document.getElementById('loreModal');
    const collectedLoreModal = document.getElementById('collectedLoreModal');
    if (loreModal && event.target == loreModal) { closeLoreModal(); }
    if (collectedLoreModal && event.target == collectedLoreModal) { closeCollectedLoreModal(); }
}

// --- Progressive Corruption Logic ---
function applyCorruptionEffect() {
    console.log("Applying corruption effect based on completion status...");
    let corruptionLevel = 0;

    const hardFinalDone = localStorage.getItem('enigmaHardFinalComplete') === 'true';
    const easyFinalDone = localStorage.getItem('enigmaEasyFinalComplete') === 'true';

    if (hardFinalDone) {
        corruptionLevel = 2;
        console.log("Corruption Level 2 triggered (Hard Final Complete).");
    } else if (easyFinalDone) {
        corruptionLevel = 1;
        console.log("Corruption Level 1 triggered (Easy Final Complete).");
    } else {
         console.log("No corruption applied (based on final flags).");
    }

    const bodyElement = document.body;
    bodyElement.classList.remove('corruption-level-1', 'corruption-level-2');
    if (corruptionLevel === 1) {
        bodyElement.classList.add('corruption-level-1');
    } else if (corruptionLevel === 2) {
        bodyElement.classList.add('corruption-level-2');
    }
}

// --- Speech Synthesis Functions (Optional) ---
function speakText(text, rate = 0.9, pitch = 0.8) {
    if (!speechEnabled || !text) return;

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 0.8;

        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
             utterance.voice = voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Google')) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
             window.speechSynthesis.speak(utterance);
        } else {
            // Wait for voices if needed (browser quirk)
            window.speechSynthesis.onvoiceschanged = () => {
                 voices = window.speechSynthesis.getVoices();
                 utterance.voice = voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Google')) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
                 window.speechSynthesis.speak(utterance);
                 window.speechSynthesis.onvoiceschanged = null;
            };
             // Fallback speak in case event doesn't fire quickly
             setTimeout(() => {
                // Check again if voices loaded before speaking
                if(window.speechSynthesis.getVoices().length > 0) {
                    voices = window.speechSynthesis.getVoices();
                    utterance.voice = voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Google')) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
                }
                window.speechSynthesis.speak(utterance);
             }, 250);
        }
    } else {
        console.warn("Web Speech API not supported.");
        speechEnabled = false;
        // Update button state if you add one
    }
}

function toggleSpeech(button) {
    speechEnabled = !speechEnabled;
    if (speechEnabled) {
        button.textContent = 'Speak: ON';
        speakText("Speech enabled.");
         if (window.speechSynthesis.getVoices().length === 0) {
             window.speechSynthesis.getVoices(); // Pre-load voices
         }
    } else {
        button.textContent = 'Speak: OFF';
        window.speechSynthesis.cancel();
    }
    console.log("Speech enabled:", speechEnabled);
}

// --- END ---

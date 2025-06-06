// riddle-data.js
// Contains riddle structures and answer hashes for Terminal Enigma.

// --- Riddle Answer Hashes (Easy, Hard, Final) ---
// Hashes for Nightmare riddles (if input-based) should be defined within nightmare-riddles.js
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

// --- Main Riddle Data Structure ---
// Nightmare riddles are loaded from nightmare-riddles.js and added during initialization
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

    finalRiddles: {
        easy: { // Rewritten Final Easy Riddle
            riddle: "Initiating Employee Integration Protocol...\nSignal fragmented. Recovery required.\n\nSegment Alpha (Base64): `VGhlIGtleSBpcyBoaWRkZW4gd2l0aGluIGEgc2liLINGLCBidXQgb25seSBvbmUgc3BlYWtzIHRydWUu`\n\nDecode Segment Alpha. The message reveals the location of Segment Beta within this very transmission's structure (Inspect Element is your tool). Segment Beta holds the final component.\n\nCombine the components. What concept represents the unwinding of a self-referential process to reach a base state?\n> Keyword:",
            interactiveElement: `<span id="segment-beta-location" style="position: absolute; left: -9999px; opacity: 0; pointer-events: none;"><span data-sibling="false">Ignore Me</span><span data-sibling="true" style="color: transparent; user-select: none;">unwound</span><span data-sibling="false">Ignore Me Too</span></span><div style="margin-top:10px; font-size: 14px; color: #888;">(Hint: Use an online Base64 decoder for Segment Alpha. Then use your browser's 'Inspect Element' tool on this page.)</div>`,
            setupScript: null,
            solutionCheckType: 'input',
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

// Add nightmare riddles if they were loaded successfully
if (typeof nightmareRiddles !== 'undefined') {
    allRiddles.nightmare = nightmareRiddles;
} else {
    // Fallback if nightmare-riddles.js failed to load
    allRiddles.nightmare = { frontend: [], backend: [], database: [] };
    console.error("CRITICAL: Nightmare riddle data was not loaded. Nightmare mode will be empty.");
}

console.log("Riddle Data Initialized."); // Log successful data setup

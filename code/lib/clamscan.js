//environment variables
const ClamAVHost = process.env.ClamAVHost ? process.env.ClamAVHost : '127.0.0.1';
const ClamAVPort = parseInt(process.env.ClamAVPort);
const ClamAVTimeout = parseInt(process.env.ClamAVTimeout);

const NodeClam = require('clamscan');
const clamScan = new NodeClam().init({
    removeInfected: false, // If true, removes infected files
    quarantineInfected: false, // False: Don't quarantine, Path: Moves files to this place.
    scanLog: null, // Path to a writeable log file to write scan results into
    debugMode: false, // Whether or not to log info/debug/error msgs to the console
    fileList: null, // path to file containing list of files to scan (for scanFiles method)
    scanRecursively: true, // If true, deep scan folders recursively
    clamscan: {
        path: '/usr/bin/clamscan', // Path to clamscan binary on your server
        db: null, // Path to a custom virus definition database
        scanArchives: true, // If true, scan archives (ex. zip, rar, tar, dmg, iso, etc...)
        active: true // If true, this module will consider using the clamscan binary
    },
    clamdscan: {
        socket: false, // Socket file for connecting via TCP ///var/run/clamav/clamd.ctl
        host: ClamAVHost, // IP of host to connect to TCP interface
        port: ClamAVPort ? ClamAVPort : 3310, // Port of host to use when connecting via TCP interface
        timeout: ClamAVTimeout ? ClamAVTimeout : 180000, // Timeout for scanning files
        localFallback: false, // Do no fail over to binary-method of scanning
        path: '/usr/bin/clamdscan', // Path to the clamdscan binary on your server
        configFile: null, // Specify config file if it's in an unusual place
        multiscan: true, // Scan using all available cores! Yay!
        reloadDb: false, // If true, will re-load the DB on every call (slow)
        active: true, // If true, this module will consider using the clamdscan binary
        bypassTest: false, // Check to see if socket is available when applicable
    },
    preference: 'clamdscan' // If clamdscan is found and active, it will be used by default
})
    .catch(err => {
        console.error("Internal Server Error: Could not connect to ClamAV Daemon");
        console.error(err);
        process.exit();
    })

async function ScanStream(fileStream) {
    try {
        return await clamScan
            .then(async cscan => {
                return await cscan.scanStream(fileStream);
            })

    } catch (e) {
        console.error(e);
        if(e.code === 'NoSuchKey' || e.code === 'NoSuchBucket'){
            throw new Error(e);
        }
        throw new Error("Scan Stream Fail",);
    }
};

module.exports = { ScanStream };
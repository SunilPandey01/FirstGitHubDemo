const enableLoggingDebug = Boolean(process.env.EnableLoggingDebug == "true");
const { fetchS3Body, addS3Tags, headObject } = require("../lib/s3");
const { isValidSize, byteConverter } = require("../lib/conversion-helper")
const { fetchContentFilepath } = require("../lib/filepath.js");
const { ScanStream } = require("../lib/clamscan");
const { validateBody } = require("../models/schemas/validateBody");
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Scanner program is live!");
});

router.post("/s3-scan", async (req, res, next) => {
  const result = validateBody(req.body);
  if (result.error) {
    return next(result.error);
  }

  let objectMetadata = await headObject({ Bucket: result.value.Bucket, Key: result.value.Key});
  if(!isValidSize(objectMetadata.ContentLength)){
    let tagSet = [
      {
        Key: "scan-result",
        Value: "SIZE EXCEEDED TO SCAN",
      }
    ];
    await addS3Tags(result.value.Bucket, result.value.Key, tagSet);
    enableLoggingDebug && console.warn("File size too large to be scanned",byteConverter(objectMetadata.ContentLength),"file");
    throw new Error("Large File Size");
  }

  /* If Filepath is not undefined, get the stream from Filepath else fetch the S3Body */
  const streamToScan = result.value.Filepath
    ? await fetchContentFilepath(result.value.Filepath)
    : await fetchS3Body({ Bucket: result.value.Bucket, Key: result.value.Key }); 
  
  const { isInfected, viruses } = await ScanStream(streamToScan);

  if (isInfected) {
    //standard status report
    /* If isInfected and Bucket is present... */
    if (result.value.Bucket) {
      let tagSet = [
        {
          Key: "clamscan-result",
          Value: "INFECTED",
        },
        {
          Key: "clamscan-viruses",
          Value: viruses.join(","),
        },
      ];
      await addS3Tags(result.value.Bucket, result.value.Key, tagSet);
    }
    res.send({
      outcome: "warning",
      messages: viruses.map((virus) => {
        return {
          severity: "warning",
          context: "VirusInfection",
          message: {
            virusId: virus,
          },
        };
      }),
    });
  } //201 for success
  else {
    if (result.value.Bucket) {
      let tagSet = [
        {
          Key: "clamscan-result",
          Value: "CLEAN",
        },
      ];
      await addS3Tags(result.value.Bucket, result.value.Key, tagSet);
    }
    res.status(200).send({
      outcome: "success",
      messages: [
        {
          severity: "informational",
          context: "FileIsClean",
          message: {
            details: "no virus found, file is clean",
          },
        },
      ],
    });
  }
});

module.exports = router;

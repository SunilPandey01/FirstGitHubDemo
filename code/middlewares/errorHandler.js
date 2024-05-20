module.exports = (error, req, res, next) => {
  if (error.message.startsWith('"value" must contain at least one of [Filepath, Bucket]') ) {
    return res.status(400).json({
      outcome: "failure",
      messages: [
        {
          severity: "error",
          context: "ValidationFail",
          message: {
            details: "Neither Filepath or Bucket founded",
          },
        },
      ],
    });
  } else if (error.stack.startsWith("ValidationError")) {
    return res.status(400).json({
      outcome: "failure",
      messages: [
        {
          severity: "error",
          context: "ValidationFail",
          message: {
            details: error.message,
          },
        },
      ],
    });
  } else if (error.message.startsWith("NoSuchKey")) {
    return res.status(400).json({
      outcome: "failure",
      messages: [
        {
          severity: "error",
          context: "WrongS3ObjectKey",
          message: {
            details: "The specified S3 object does not exist",
          },
        },
      ],
    });
  } else if (error.message.startsWith("NoSuchBucket")) {
    return res.status(400).json({
      outcome: "failure",
      messages: [
        {
          severity: "error",
          context: "WrongS3Bucket",
          message: {
            details: "The specified S3 bucket does not exist",
          },
        },
      ],
    });
  } else if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      outcome: "failure",
      messages: [
        {
          severity: "error",
          context: "WrongPayload",
          message: {
            details: "Failed to parse request payload",
          },
        },
      ],
    });
  }
  switch (error.message) {
    case "S3 Fetch Fail":
      res.status(500).json({
        outcome: "failure",
        messages: [
          {
            severity: "error",
            context: "S3Fail",
            message: {
              details: "Failed to fetch the requested S3 Object",
            },
          },
        ],
      });
      break;
    case "S3 Tag Fail":
      res.status(500).json({
        outcome: "failure",
        messages: [
          {
            severity: "error",
            context: "S3Fail",
            message: {
              details: "Failed to tag the requested S3 Object",
            },
          },
        ],
      });
      break;
    case "Scan Stream Fail":
      res.status(500).json({
        outcome: "failure",
        messages: [
          {
            severity: "error",
            context: "ScanFail",
            message: {
              details: "Failed to scan the requested S3 Object",
            },
          },
        ],
      });
      break;
      case "Large File Size":
        res.status(413).json({
          outcome: "warning",
          messages: [
            {
              severity: "warning",
              context: "SizeLimitReached",
              message: {
                details: "File size limit exceeded",
              },
            },
          ],
        });
        break;
    default:
      res.status(500).json({
        outcome: "failure",
        messages: [
          {
            severity: "error",
            context: "ServerFail",
            message: {
              details: "Internal Server Error",
            },
          },
        ],
      });
  }
};

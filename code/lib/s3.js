const {
    S3Client,
    GetObjectCommand,
    PutObjectTaggingCommand,
    HeadObjectCommand,
  } = require("@aws-sdk/client-s3");
  const s3 = new S3Client();
  
  async function fetchS3Body(params) {
    try {
      const response = await s3.send(new GetObjectCommand(params));
      return response.Body;
    } catch (e) {
      console.error(e);
      throw new Error("S3 Fetch Fail");
    }
  }
  
  async function addS3Tags(bucket, fileName, tagSet) {
    //@params:
    //  Bucket -> string
    //  filename -> string
    //  tagSet -> Array of tag objects (eg. [{"Key":"TagKey", "Value":"TagValue"}])
    try {
      var params = {
        Bucket: bucket,
        Key: fileName,
        Tagging: {
          TagSet: tagSet,
        },
      };
  
      await s3.send(new PutObjectTaggingCommand(params));
    } catch (e) {
      console.error(e);
      throw new Error("S3 Tag Fail");
    }
  }
  
  async function headObject(params) {
    try {
       return await s3.send(new HeadObjectCommand(params));
    } catch (e) {
      console.error(e);
      throw new Error("Fetch S3 Fail");
    }
  }

module.exports = { fetchS3Body, addS3Tags, headObject };
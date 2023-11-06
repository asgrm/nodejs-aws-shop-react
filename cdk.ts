import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as deployment from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";

const app = new cdk.App();
const stack = new cdk.Stack(app, "MyShopClouFrontStack1", {
  env: { region: "eu-west-1" },
});

const bucket = new s3.Bucket(stack, "WebAppBucket", {
  bucketName: "asgrm-nodejs-aws-shop-react",
  autoDeleteObjects: true,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});

const originAccessIdentity = new cloudfront.OriginAccessIdentity(
  stack,
  "ShopBucketIdentity"
);

bucket.grantRead(originAccessIdentity);

const cf = new cloudfront.Distribution(stack, "WebAppDistribution", {
  defaultBehavior: {
    origin: new origins.S3Origin(bucket, {
      originAccessIdentity,
    }),
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
  },
  defaultRootObject: "index.html",
  errorResponses: [
    {
      httpStatus: 404,
      responseHttpStatus: 200,
      responsePagePath: "/index.html",
    },
  ],
});

new deployment.BucketDeployment(stack, "DeployWebsite", {
  sources: [deployment.Source.asset("./dist")],
  destinationBucket: bucket,
  distribution: cf,
  distributionPaths: ["/*"],
});

new cdk.CfnOutput(stack, "S3bucket Url", {
  value: bucket.bucketWebsiteUrl,
});

new cdk.CfnOutput(stack, "Cloudfront Url", {
  value: cf.distributionDomainName,
});

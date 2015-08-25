Continous AWS Lambda Invocation from CloudWatch
===============================================

This is an example stack to show you how to create a AWS Lambda function with repeatable invocations.

There are a couple of motivations that make me to try out this concept.

- I have events that not originate from AWS infrastructure
- I don't have control and no idea when the external event will happen, so I need to do some active check.
- I have a very small job that just can fit in the 60 seconds window
- I want to spend less as possible to run/maintain the job

### How this work

So how this works? Very simple, I have a Lambda function deployed along with a CloudWatch alarm and an SNS Topic. The SNS topic has the same Lambda function as a subscriber. On the events of INSUFFICIAN\_DATA state, CloudWatch alarm send message to the SNS topic, and the Lambda function will be invoked via SNS.

The magic part of the setup is the CloudWatch Metric I am going to choose. I am using Lambda CloudWatch Metric, **Invocations**, and mesure the **sample count** statistic.

### How to set this up and play

I have included a **hello world** Lambda function and the CloudFormation template to create the stack. 

**Note**

There is a little bit of manual work is required to setup Lambda function's event source to use the SNS topic. I can't find this is configurable in CloudFormation so far.


**Step 1 - Create Lambda Function Stack**

```sh
aws cloudformation create-stack LazyLambda                                             \
  --template-body file://LambdaFunction.json                                           \
  --parameters ParameterKey="deploymentBucket",ParameterValue="YOUR-S3-BUCKET"         \
               ParameterKey="packageName",ParameterValue="hello-world/hello-world.zip" \
               ParameterKey="handler",ParameterValue="hello-world.handler"
```

**Step 2 - Manually add event source**

Login to the AWS Console Lambda Service, and select the function created by the above stack, edit the **event source** option to add in the SNS Topic created in the same stack.

**Step 3 - Trigger the first invocation manaully**

You need to login to Lambda Console and trigger a test SNS message to the function, to kickoff the CloudWatch Alarm.

### Caveat

The interval of the invocations from CloudWatch is vary. In the experiment, I used **60 second** period, and **1** as evaluation period. The invocation interval is around 5 to 6 minutes (I think it is rely on the evaluation minimum evaluation period for Lambda function, 5 minutes I think it is the current limitation.)

So I think this is something that good for loose coupling non-production stuff, for production, you want something more reliable. ;)

### Cost

the estimated monthly cost for this hello-world function is 50 cent/month

Calculation: 

- Lambda: 5 seconds run time x ( 30 days x 24 hours x 60 minutes / 5 minutes ) - 3,200,000 free tier seconds
- CloudWatch: $0.10/alarm/month + $0.76/GB ingested
- SNS: Free

### The Unlicense

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>



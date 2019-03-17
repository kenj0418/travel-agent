#TODO Modify this and setup in code-build instead
#Gave up on integrating the skill into the cloud formation template because Alexa's cloud formation usage is so horribly broken

#cd skills/travel-agent
#zip ../../../alexa-travel-agent-skill.zip * -r
#cd ../..
#aws s3 cp ../alexa-travel-agent.zip s3://kenj0418-alexa-travel-agent/deployables/alexa-travel-agent-skill-0.zip

# ask util generate-lwa-tokens --scope "alexa::ask:skills:readwrite alexa::ask:models:readwrite profile"

#todo check cloud formation template to get Lambda Arn

cd skills/travel-agent
ask deploy
cd ../..

echo TODO build the skill package and upload to S3

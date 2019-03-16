#TODO Modify this and setup in code-build instead
#TODO Fix the permissions for the SkillRole in the CF template

npm prune --production
zip ../alexa-travel-agent.zip * -r
aws s3 cp ../alexa-travel-agent.zip s3://kenj0418-alexa-travel-agent/deployables/alexa-travel-agent-0.zip
cd skills/travel-agent
zip ../../../alexa-travel-agent-skill.zip * -r
cd ../..
aws s3 cp ../alexa-travel-agent.zip s3://kenj0418-alexa-travel-agent/deployables/alexa-travel-agent-skill-0.zip

#ask util generate-lwa-tokens --scope "alexa::ask:skills:readwrite alexa::ask:models:readwrite profile"
echo TODO build the skill package and upload to S3
echo TODO upload the lambda zip into the lambda

#restoring dev dependancies to avoid being annoying (disable when move to a CI build script)
npm i
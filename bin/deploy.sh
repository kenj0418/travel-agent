#TODO Modify this and setup in code-build instead

npm prune --production
zip ../alexa-travel-agent.zip * -r
aws s3 cp ../alexa-travel-agent.zip s3://kenj0418-alexa-travel-agent/deployables/alexa-travel-agent-0.zip

aws lambda update-function-code --function-name alexa-travel-agent-TravelAgentLambda-16TP3I0ZKN1W3 --s3-bucket kenj0418-alexa-travel-agent --s3-key "deployables/alexa-travel-agent-0.zip"

#todo restoring dev dependancies to avoid being annoying (disable when move to a CI build script)
#npm i
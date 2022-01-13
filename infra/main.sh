#!/bin/bash

while getopts c:e:s: flag
do
    case "${flag}" in
        c) command=${OPTARG};;
        e) env=${OPTARG};;
        s) stack=${OPTARG};;
    esac
done



stacks=("shared" "images" "thumbnails")

fullCommand=""

case $command in
  "config")
    if  [[ "$env" == "dev" ]]
    then
      docker-compose up -d
      fullCommand="cdklocal bootstrap -c env=$env --require-approval never"
    else
      fullCommand="cdk bootstrap --profile sinapsis-$env -c env=$env"
    fi
  ;;

  "deploy")
    for i in "${stacks[@]}"
    do
      if  [[ "$env" == "dev" ]]
      then
        fullCommand="cdklocal deploy $i-$env -c env=$env --require-approval never"
      else
        fullCommand="cdk deploy $i-$env --profile sinapsis-$env -c env=$env"
      fi

        echo "Executing started \n Command: $fullCommand \n Stack: $i \n Env: $env \n\n"
        eval "$fullCommand"
        echo "Executing finished \n Command: $fullCommand \n Stack: $i \n Env: $env \n\n"
    done
  ;;

  "deployStack")
    if  [[ "$env" == "dev" ]]
    then
      fullCommand="cdklocal deploy $stack-$env -c env=$env --require-approval never"
    else
      fullCommand="cdk deploy $stack-$env --profile sinapsis-$env -c env=$env"
    fi
  ;;

  "destroy")
    if  [[ "$env" == "dev" ]]
    then
      fullCommand="cdklocal destroy --all -c env=$env --require-approval never"
    else
      fullCommand="cdk destroy --all --profile sinapsis-$env -c env=$env"
    fi
  ;;

  "destroyStack")
    if  [[ "$env" == "dev" ]]
    then
      fullCommand="cdklocal destroy $stack-$env -c env=$env --require-approval never"
    else
      fullCommand="cdk destroy $stack-$env --profile sinapsis-$env -c env=$env"
    fi
  ;;
esac

if  [[ "$command" != "deploy" ]]
then
  echo "Executing started \n Command: $fullCommand \n Stack: $stack \n Env: $env \n\n"
  eval "$fullCommand"
  echo "Executing finished \n Command: $fullCommand \n Stack: $stack \n Env: $env \n\n"
fi


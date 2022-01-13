#!/bin/bash

while getopts c:e:s: flag
do
    case "${flag}" in
        c) command=${OPTARG};;
        e) env=${OPTARG};;
        s) stack=${OPTARG};;
    esac
done

if  [ "$command" == "start" ] && [ "$env" == "dev" ];
then
    serverless-offline-multi --directory images --port 3001 --directory thumbnails --port 3002
else

    services=("layers" "images" "thumbnails")

    fullCommand=""

    case $command in
    "install")
        fullCommand="npm i"
    ;;
    "deploy")
        fullCommand="sls deploy --stage $env"
    ;;
    "destroy")
        fullCommand="sls remove --stage $env"
    ;;
    "test")
        services=("images" "thumbnails")
        fullCommand="npm run test"
    ;;
    esac

    runIndividual="true"

    for i in "${services[@]}"
    do
        if [ -z "$stack" ]
        then
            runIndividual="true"
        else
            if  [[ "$stack" == "$i" ]]
            then
                runIndividual="true"
            else
                runIndividual="false"
            fi
        fi

        if [[ "$runIndividual" == "true" ]]
        then
            cd "$i"

            if [ "$i" == "layers" ]
            then
                cd src/general/nodejs/
                echo -e "Installing sharp in layer for lambda\n"
                npm install --platform=linux --arch=x64 sharp --save
                cd ../../..
            fi

            echo -e "Executing started \n Command: $fullCommand \n Stack: $i \n Env: $env \n\n"
            eval $fullCommand
            echo -e "Executing finished \n Command: $fullCommand \n Stack: $i \n Env: $env \n\n"

            if [ "$i" == "layers" ]
            then
                cd src/general/nodejs/
                echo -e "Reinstalling sharp in layer for local environment\n"
                npm install sharp --save
                cd ../../..
            fi

            cd ..
        fi
    done
fi
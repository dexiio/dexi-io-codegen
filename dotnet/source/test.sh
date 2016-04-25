#!/usr/bin/env bash
command_exists () {
    type "$1" &> /dev/null
}

fail_if_not_installed () {
    if ! command_exists $1 ; then
        echo "$1 is not installed"
        exit 1;
    fi
}

fail_if_not_installed java
fail_if_not_installed mvn

cd "$(dirname "$0")"
mvn clean test

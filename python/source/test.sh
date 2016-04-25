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

fail_if_not_installed python
fail_if_not_installed virtualenv

cd "$(dirname "$0")"
VENV_DIR='../venv'
if [ ! -d ${VENV_DIR} ]; then
    echo 'Virtualenv dir not exists, creating..'
    virtualenv ${VENV_DIR}
fi
. ${VENV_DIR}/bin/activate
pip install --upgrade pip
echo 'Updating dependencies using PIP..'
pip install -r requirements.txt
echo 'Running tests..'
python test.py

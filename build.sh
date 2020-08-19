#!/bin/bash

SOURCE=dist/lsuser.js
TARGET=dist/lsuser
BIN_FOLDER=~/.local/bin

echo "#!$(which node)" > $TARGET
cat $SOURCE >> $TARGET
rm -f $SOURCE
chmod u+x $TARGET
cp $TARGET $BIN_FOLDER
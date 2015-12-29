#!/bin/bash
#
# Sorry, no Windows version :(
# Overwrite "victim" file with random content on random time interval.
# Used in conjunction with `grunt leak` when detecting memory leaks.
#

VICTIM=$1

if [ -z $1 ] ; then
  echo '"Victim" file name missing';
  exit 1;
fi

trap "cat /dev/null > $VICTIM; exit 0" SIGTERM

while true; do
  dd if=/dev/urandom of=$VICTIM bs=32 count=1 > /dev/null 2>&1
  sleep $(shuf -i 3-12 -n 1)
done

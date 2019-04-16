"""create a key for citationStyles listed in folder /csl"""

from os import listdir
from os.path import isfile, join

mypath = "/home/markg/dissertation/previousGithub1B/1-Billion-Citation-Dataset/dataset-creation/csl"

cslFiles = [f.rstrip('.csl') for f in listdir(mypath) if isfile(join(mypath, f))]

with open('cslIndex.csv', 'w') as f:
    f.write("index,citationStyle\n")
    for i in range(len(cslFiles)):
        f.write(str(i) + "," + str(cslFiles[i]) + "\n")

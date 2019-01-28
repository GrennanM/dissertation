""" a small script to reformat CORA Information Extraction dataset for use with GROBID citation_model
Original CORA dataset: https://people.cs.umass.edu/~mccallum/data.html
GROBID: https://github.com/kermitt2/grobid
"""

import re

# read lines of file into a list
lines = [line for line in open('/home/markg/dissertation/github/datasets/coraReformatted/sample_to_reformat.txt')]
ammendedlines = []

for line in lines:
    # remove <NEWREFERENCE> with 3, 2 or 1` digits
    line = re.sub(r'<NEWREFERENCE>[0-9][0-9][0-9]|<NEWREFERENCE>[0-9][0-9]|<NEWREFERENCE>[0-9]|<NEWREFERENCE>', '', line)

    # replace anything before <author> with <bibl><author>
    line = re.sub('.*<author>', '<bibl><author>', line)

    # replace title to <title level="a"> </title>
    line = re.sub('<title>', '<title level="a">', line)

    # replace journal with <title level="j">
    line = re.sub('<journal>', '<title level="j">', line)
    line = re.sub('</journal', '</title', line)

    # replace volume with <biblScope unit="volume">
    line = re.sub('<volume>', '<biblScope unit="volume">', line)
    line = re.sub('</volume>', '</biblScope>', line)

    # replace pages
    line = re.sub('<pages>', '<biblScope unit="page">', line)
    line = re.sub('</pages>', '</biblScope>', line)

    # replace address
    line = re.sub('<address>', '<pubPlace>', line)
    line = re.sub('</address>', '</pubPlace>', line)

    # replace booktitle
    line = re.sub('<booktitle>', '<title level="m">', line)
    line = re.sub('</booktitle>', '</title>', line)

    # kibl and utgo file only
    # # replace <year> containing brackets (CHECK!)
    # line = re.sub('<year>.*?\(', '(<date>', line)
    # line = re.sub('\).*</year>', '</date>)', line)
    #
    # # replace year as date (no brackets) (CHECK!)
    # line = re.sub('<year>', '<date>', line)
    # line = re.sub('</year>', '</date>', line)

    # remove brackets in date if present (fahl file only)
    line = re.sub('<date>.*?\(', '(<date>', line)
    line = re.sub('\).*</date>', '</date>)', line)

    # & caused a problem with build
    # replaced & with ','
    line = re.sub(' &', ',', line)

    # remove any blank lines
    if line != '\n':
        ammendedlines.append(line)

ammendedlines2 = []

# put </bibl> at end of line
for line in ammendedlines:
    line = re.sub('\n', '</bibl>\n', line)
    ammendedlines2.append(line)

# write ammended file
with open('/home/markg/grobid-0.5.3/grobid-trainer/resources/dataset/citation/corpus/reformatted_sample.xml', 'w') as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n\n')
    f.write("<citations>\n\n")

    for item in ammendedlines2:
        f.write("%s\n" % item)

    f.write("</citations>")

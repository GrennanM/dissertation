import re
import pandas as pd
import numpy as np

originalData = '/home/markg/dissertation/github/create1BillionDataset/MARTIN_output_strings_50_rand915.csv'
annotatedData = pd.read_csv(originalData)

# create new column
annotatedData['newString'] = np.nan

# tags to remove
tags = ['<author>', '</author>', '<family>', '<family>', '<given>', '</given>',
        '<family>', '</family>', '<container-title>', '</container-title>',
        '<issued>', '</issued>', '<year>', '</year>', '<volume>', '</volume>',
        '<page>', '</page>', '<URL>', '</URL>', '<DOI>', '</DOI>',
        '<publisher>', '</publisher>', '<issue>', '</issue>', '<title>', '</title>',
        '<container-title-short>', '</container-title-short>', '<month>', '</month>',
        '<day>', '</day>', '<editor>', '</editor>', '<ISSN>', '</ISSN>', '<ISBN>', '</ISBN>',
        '<source>', '</source>', '<italic>', '</italic>', '\&lt\;italic\&rt\;',
        '<page\-first>', '</page\-first>', '<editor translator>', '</editor translator>',
        '<original-title>', '</original-title>',
        '<i>', '</i>', '<I>', '</I>', '\&lt\;i\&rt\;', '\&lt\;/i\&rt\;',
        '\&lt\;/italic\&rt\;', '\&lt\;title\&rt\;', '\&lt\;/title\&rt\;']

newRows = []

for line in annotatedData['annotated']:

    # remove tags from each line
    for tag in tags:
        line = re.sub(tag, '', line)

    # changes from annotated to string format
    line = re.sub('\&lt;', '<', line)
    line = re.sub('\&rt;', '>', line)
    line = re.sub('\&gt;', '>', line)
    line = re.sub(r"\.\.", ".", line)
    line = re.sub("”,", ",”", line)
    line = re.sub("\?\.", "?", line)
    line = re.sub("\.>", ">.", line)
    line = re.sub("’,", ".’", line)
    line = re.sub("\”\.", ".”", line)
    line = re.sub("’\.", ".’", line)

    # remove double whitespace before date and replace with single whitespace
    try:
        originalDate = re.findall("\s\s[0-9][0-9][0-9][0-9]", line)
        newDate = re.sub("\s", "", originalDate[0], 1)
        line = re.sub(originalDate[0], newDate, line)
    except:
        pass

    newRows.append(line)

annotatedData['newString'] = newRows

annotatedData.to_csv('dataWithStrings.csv', index=True)


# # read lines of file into a list
# lines = [line for line in open(
#     '/home/markg/dissertation/github/create1BillionDataset/validation/1000sample/validation1000annotations.txt')]
#
# ammendedLines = []
#
# # remove tags
# tags = ['<author>', '</author>', '<family>', '<family>', '<given>', '</given>',
#         '<family>', '</family>', '<container-title>', '</container-title>',
#         '<issued>', '</issued>', '<year>', '</year>', '<volume>', '</volume>',
#         '<page>', '</page>', '<URL>', '</URL>', '<DOI>', '</DOI>',
#         '<publisher>', '</publisher>', '<issue>', '</issue>', '<title>', '</title>',
#         '<container-title-short>', '</container-title-short>', '<month>', '</month>',
#         '<day>', '</day>', '<editor>', '</editor>', '<ISSN>', '</ISSN>', '<ISBN>', '</ISBN>',
#         '<source>', '</source>', '<italic>', '</italic>', '\&lt\;italic\&rt\;',
#         '<page\-first>', '</page\-first>', '<editor translator>', '</editor translator>',
#         '<original-title>', '</original-title>',
#         '<i>', '</i>', '<I>', '</I>', '\&lt\;i\&rt\;', '\&lt\;/i\&rt\;',
#         '\&lt\;/italic\&rt\;', '\&lt\;title\&rt\;', '\&lt\;/title\&rt\;']
#
# for line in lines:
#
#     # remove tags from each line
#     for tag in tags:
#         try:
#             line = re.sub(tag, '', line)
#         except:
#             print ("Not found: ", tag)
#             pass
#
#     # changes from annotated to string format
#     line = re.sub('\&lt;', '<', line)
#     line = re.sub('\&rt;', '>', line)
#     line = re.sub('\&gt;', '>', line)
#     line = re.sub(r"\.\.", ".", line)
#     line = re.sub("”,", ",”", line)
#     line = re.sub("\?\.", "?", line)
#     line = re.sub("\.>", ">.", line)
#     line = re.sub("’,", ".’", line)
#     line = re.sub("\”\.", ".”", line)
#     line = re.sub("’\.", ".’", line)
#
#     # remove double whitespace before date and replace with single whitespace
#     try:
#         originalDate = re.findall("\s\s[0-9][0-9][0-9][0-9]", line)
#         newDate = re.sub("\s", "", originalDate[0], 1)
#         line = re.sub(originalDate[0], newDate, line)
#     except:
#         pass
#
#     ammendedLines.append(line)
#
# with open('/home/markg/dissertation/github/create1BillionDataset/validation/1000sample/1000AnnotationsWithTagsRemoved.txt', 'w') as f:
#     for item in ammendedLines:
#         f.write(item)

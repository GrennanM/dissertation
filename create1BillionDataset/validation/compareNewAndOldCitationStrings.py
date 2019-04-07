import pandas as pd
import numpy as np

originalData = '/home/markg/dissertation/github/create1BillionDataset/validation/dataWithStrings.csv'
annotatedData = pd.read_csv(originalData)

count = 0

annotatedData['count'] = np.where(annotatedData['citationstring'] == annotatedData['newString'], 1, 0)
totalSame = annotatedData['count'].sum()

print ("Percentage equal: ", totalSame / len(annotatedData.index) * 100)


# f1 = open("/home/markg/dissertation/github/create1BillionDataset/validation/sample/newStrings10.txt","r")
# f2 = open("/home/markg/dissertation/github/create1BillionDataset/validation/1000sample/validation1000strings.txt","r")
#
# count = 0
#
# for line1 in f1:
#     for line2 in f2:
#         if line1 == line2:
#             count += 1
#         else:
#             print (line1)
#             print (line2)
#         #     print ("-" * 50)
#             # print (count)
#         break
# f1.close()
# f2.close()
#
# # print ("Number of lines the same: ", count)

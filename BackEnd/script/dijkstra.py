import sys
import pandas as pd
import numpy as np
from dijkstar import Graph, find_path

src = int(sys.argv[1])
dest = int(sys.argv[2])

graph = Graph.load("/Users/Ryan/Desktop/tensorly/graph.txt")

cost_func = lambda u, v, e, prev_e: e['cost']

try:
    ans = find_path(graph, src, dest, cost_func=cost_func)[0]
    print(ans)
except:
    print("No Path between these two vertex")

sys.stdout.flush()
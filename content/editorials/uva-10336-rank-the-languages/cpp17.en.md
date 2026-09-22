A cell is replaced by `.` before it is pushed onto `pending`. That immediate marking prevents two already reached neighbors from adding it twice. The language character is saved before changing the starting cell and is then used for every neighbor comparison in that traversal.

`cells` records the region size during exploration, but the language total is increased by exactly one after the whole traversal. This separates country count from area and also supports the mutation checks used for this problem.

Only positive-count language indices enter `order`. Its comparator first puts larger component counts first and then compares indices, whose natural order corresponds to letters `a` through `z`.

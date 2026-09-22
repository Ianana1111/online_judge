Each `Job` keeps time, fine, and original ID together so sorting cannot separate related data. The comparator calculates both adjacent-order cross products in `long long`; unequal products determine cost order, and equal products use ID order.

Output reads `jobs[i].id`, not the post-sort index. A blank line is emitted before every case except the first, IDs use one separating space, and each case ends with one newline.

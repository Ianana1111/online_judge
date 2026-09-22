Input uses an unsigned wide type to cover the entire 32-bit unsigned range. Both search bounds and `mid*mid` use the same safe type.

The inclusive `low<=high` condition tests a final singleton candidate. Since legal n is at least one and mid starts positive, decrementing `high=mid-1` does not underflow. Every case resets its search bounds and `square` flag, and zero terminates before producing output.

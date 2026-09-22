Singapore will host a Formula One race in 2008. The race will be held on a 5.067km long street circuit, consisting of 14 left hand turns and 10 right hand turns. In the run up to the F1 race, the number of illegal night street racing activities have been on the rise. Such races consists of several rounds around a designated street circuit.

The authorities would like to deploy a new vehicle monitoring system in order to catch these illegal racers. The system consists of a number of cameras mounted along various roads. For the system to be effective, there should be at least one camera along each of the possible circuits.

The Singapore road system can be represented as a series of junctions and connecting bidirectional roads (see Figure 5).

![Road network with junctions 1-6, road costs, and two cameras placed to cover every circuit](/problem-images/uva-1234-racing.png) A possible racing circuit consists of a start junction followed by a path consisting of three or more roads that eventually leads back to the start junction. Each road in a racing circuit can be traversed only in one direction, and only once.

Your task is to write a program that computes the optimal placement of the vehicle-monitoring cameras. You will be provided with a description of a connected road network to be monitored in terms of the roads and junctions. The junctions are identified by the bigger numbers in Figure 5. A camera can be deployed on the roads (and not the junctions).

The cost of deploying a camera depends on the road on which it is placed. The smaller numbers by the roads in Figure 5 indicate the cost of deploying a camera on that road. Your job is to select a set of roads that minimizes the total cost of deployment while ensuring that there is at least one camera along every possible racing circuit (i.e. loop in the road network).

### Input

The input consists of a line containing the number c of datasets, followed by c datasets, followed by a line containing the number '0'.

The first line of each dataset contains two positive integers, n and m, separated by a blank, which represent the number of junctions and number of roads, respectively. You may assume that 0 < n < 10000 and 0 < m < 100000. For simplicity, we label each of the n junctions from 1 to n. The following m lines of each dataset each describes one road. Each line consists of three positive integers which are the labels of two different junctions and the cost of deploying a camera on this road. The cost of deploying a camera is between 1 and 1000.

### Output

The output consists of one line for each dataset. The c-th line contains one single number, representing the minimal cost of setting up the vehicle monitoring system such that there is at least one camera along every possible circuit.

Note: The sample data set depicts the situation shown in Figure 5. The two cameras show where cameras might be placed in order to monitor each circuit at minimal cost. Since each of the cameras have a cost of 3, the total minimal cost is 6.


### LOCAL platform clarification

The road network on this platform is a simple undirected connected graph: two distinct junctions have at most one road between them. Racing circuits use at least three roads, as described above.

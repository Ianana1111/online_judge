import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        int[] dx={1,1,-1,-1,2,2,-2,-2},dy={2,-2,2,-2,1,-1,1,-1};
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();
        while(input.hasNext()) {
            String from=input.next(),to=input.next();
            int start=(from.charAt(0)-'a')*8+from.charAt(1)-'1';
            int target=(to.charAt(0)-'a')*8+to.charAt(1)-'1';
            int[] distance=new int[64];Arrays.fill(distance,-1);
            ArrayDeque<Integer> queue=new ArrayDeque<>();distance[start]=0;queue.add(start);
            while(!queue.isEmpty()) {
                int at=queue.remove(),x=at/8,y=at%8;
                for(int move=0;move<8;++move) {
                    int nx=x+dx[move],ny=y+dy[move];
                    if(nx<0||nx>=8||ny<0||ny>=8) continue;
                    int next=nx*8+ny;if(distance[next]>=0) continue;
                    distance[next]=distance[at]+1;queue.add(next);
                }
            }
            output.append("To get from ").append(from).append(" to ").append(to)
                  .append(" takes ").append(distance[target]).append(" knight moves.\n");
        }
        System.out.print(output);
    }
}

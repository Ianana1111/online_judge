import java.util.PriorityQueue;
import java.util.Scanner;
class Main {
    static class Event {
        long time;int id,period;
        Event(long time,int id,int period) {this.time=time;this.id=id;this.period=period;}
    }
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();
        StringBuilder output=new StringBuilder();
        while(tests-->0) {
            int n=input.nextInt(),k=input.nextInt();String[] names=new String[n];
            PriorityQueue<Event> queue=new PriorityQueue<>((a,b)->a.time!=b.time?Long.compare(a.time,b.time):Integer.compare(a.id,b.id));
            for(int i=0;i<n;++i) {
                names[i]=input.next();int period=input.nextInt();
                queue.add(new Event(period,i,period));
            }
            while(k-->0) {
                Event event=queue.remove();
                output.append(event.time).append(' ').append(names[event.id]).append('\n');
                event.time+=event.period;queue.add(event);
            }
        }
        System.out.print(output);
    }
}

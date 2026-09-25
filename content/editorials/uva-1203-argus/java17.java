import java.util.PriorityQueue;
import java.util.Scanner;
class Main {
    static class Event {
        long time;int id,period;
        Event(long time,int id,int period) {this.time=time;this.id=id;this.period=period;}
    }
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);
        PriorityQueue<Event> events=new PriorityQueue<>((a,b)->a.time!=b.time?Long.compare(a.time,b.time):Integer.compare(a.id,b.id));
        while(input.hasNext()) {
            String command=input.next();if(command.equals("#")) break;
            int id=input.nextInt(),period=input.nextInt();
            events.add(new Event(period,id,period));
        }
        int k=input.nextInt();StringBuilder output=new StringBuilder();
        while(k-->0) {
            Event event=events.remove();output.append(event.id).append('\n');
            event.time+=event.period;events.add(event);
        }
        System.out.print(output);
    }
}

import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in); StringBuilder output=new StringBuilder();
        while(input.hasNextInt()) {
            int h=input.nextInt(),u=input.nextInt(),d=input.nextInt(),f=input.nextInt();
            if(h==0) break;
            int height=0,climb=u*100,fatigue=u*f;
            for(int day=1;;++day) {
                height+=Math.max(0,climb);
                if(height>h*100) {output.append("success on day ").append(day).append('\n');break;}
                height-=d*100;
                if(height<0) {output.append("failure on day ").append(day).append('\n');break;}
                climb-=fatigue;
            }
        }
        System.out.print(output);
    }
}

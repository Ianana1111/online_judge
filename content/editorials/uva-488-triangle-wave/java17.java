import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();
        StringBuilder output=new StringBuilder();boolean first=true;
        while(tests-->0) {
            int amplitude=input.nextInt(),frequency=input.nextInt();
            for(int wave=0;wave<frequency;++wave) {
                if(!first) output.append('\n');first=false;
                for(int h=1;h<=amplitude;++h) output.append(String.valueOf(h).repeat(h)).append('\n');
                for(int h=amplitude-1;h>=1;--h) output.append(String.valueOf(h).repeat(h)).append('\n');
            }
        }
        System.out.print(output);
    }
}

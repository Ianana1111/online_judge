import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);
        if(!input.hasNextInt()) return;
        int lists=input.nextInt(),size=input.nextInt();long previous=0;
        StringBuilder output=new StringBuilder();
        for(int i=0;i<lists;++i) {
            long current=0;
            for(int j=0;j<size-i;++j) current^=input.nextLong();
            if(i>0) output.append(previous^current).append('\n');
            previous=current;
        }
        System.out.print(output);
    }
}

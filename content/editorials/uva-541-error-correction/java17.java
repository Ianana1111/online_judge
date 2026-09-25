import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();
        while(input.hasNextInt()) {
            int n=input.nextInt();if(n==0) break;
            int[] rows=new int[n],columns=new int[n];
            for(int r=0;r<n;++r) for(int c=0;c<n;++c) {
                int bit=input.nextInt();rows[r]^=bit;columns[c]^=bit;
            }
            int oddRows=0,oddColumns=0,row=0,column=0;
            for(int i=0;i<n;++i) {
                if(rows[i]!=0) {++oddRows;row=i+1;}
                if(columns[i]!=0) {++oddColumns;column=i+1;}
            }
            if(oddRows==0 && oddColumns==0) output.append("OK\n");
            else if(oddRows==1 && oddColumns==1)
                output.append("Change bit (").append(row).append(',').append(column).append(")\n");
            else output.append("Corrupt\n");
        }
        System.out.print(output);
    }
}

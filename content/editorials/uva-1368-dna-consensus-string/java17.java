import java.util.Scanner;
class Main {
    static int indexOf(char ch) {
        if(ch=='A') return 0;if(ch=='C') return 1;if(ch=='G') return 2;return 3;
    }
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();StringBuilder output=new StringBuilder();
        String alphabet="ACGT";
        while(tests-->0) {
            int m=input.nextInt(),n=input.nextInt();String[] dna=new String[m];
            for(int i=0;i<m;++i) dna[i]=input.next();
            StringBuilder answer=new StringBuilder();int errors=0;
            for(int col=0;col<n;++col) {
                int[] count=new int[4];
                for(String row:dna) ++count[indexOf(row.charAt(col))];
                int best=0;for(int i=1;i<4;++i) if(count[i]>count[best]) best=i;
                answer.append(alphabet.charAt(best));errors+=m-count[best];
            }
            output.append(answer).append('\n').append(errors).append('\n');
        }
        System.out.print(output);
    }
}

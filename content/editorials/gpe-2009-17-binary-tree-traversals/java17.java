import java.util.Scanner;
class Main {
    static char[] preorder,inorder,answer;static int at;
    static void visit(int preStart,int left,int right) {
        if(left==right) return;
        char root=preorder[preStart];int split=left;
        while(inorder[split]!=root) ++split;
        visit(preStart+1,left,split);
        visit(preStart+1+split-left,split+1,right);
        answer[at++]=root;
    }
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();StringBuilder output=new StringBuilder();
        while(tests-->0) {
            int n=input.nextInt();preorder=new char[n];inorder=new char[n];answer=new char[n];
            for(int i=0;i<n;++i) preorder[i]=input.next().charAt(0);
            for(int i=0;i<n;++i) inorder[i]=input.next().charAt(0);
            at=0;visit(0,0,n);
            for(int i=0;i<n;++i) {if(i>0) output.append(' ');output.append(answer[i]);}
            output.append('\n');
        }
        System.out.print(output);
    }
}

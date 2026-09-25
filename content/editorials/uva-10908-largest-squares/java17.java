import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();StringBuilder output=new StringBuilder();
        while(tests-->0) {
            int rows=input.nextInt(),cols=input.nextInt(),queries=input.nextInt();
            String[] grid=new String[rows];for(int r=0;r<rows;++r) grid[r]=input.next();
            output.append(rows).append(' ').append(cols).append(' ').append(queries).append('\n');
            while(queries-->0) {
                int r=input.nextInt(),c=input.nextInt();
                int limit=Math.min(Math.min(r,c),Math.min(rows-1-r,cols-1-c));
                int radius=0;
                for(int next=1;next<=limit;++next) {
                    boolean good=true;
                    for(int offset=-next;offset<=next;++offset)
                        if(grid[r-next].charAt(c+offset)!=grid[r].charAt(c) ||
                           grid[r+next].charAt(c+offset)!=grid[r].charAt(c) ||
                           grid[r+offset].charAt(c-next)!=grid[r].charAt(c) ||
                           grid[r+offset].charAt(c+next)!=grid[r].charAt(c)) good=false;
                    if(!good) break;
                    radius=next;
                }
                output.append(2*radius+1).append('\n');
            }
        }
        System.out.print(output);
    }
}

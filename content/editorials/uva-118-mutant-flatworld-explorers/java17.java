import java.io.BufferedReader;
import java.io.InputStreamReader;
class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
        String[] size=input.readLine().trim().split("\\s+");
        int maxX=Integer.parseInt(size[0]),maxY=Integer.parseInt(size[1]);
        boolean[][] scent=new boolean[51][51];
        String directions="NESW";int[] dx={0,1,0,-1},dy={1,0,-1,0};
        StringBuilder output=new StringBuilder();String line;
        while((line=input.readLine())!=null) {
            if(line.trim().isEmpty()) continue;
            String[] start=line.trim().split("\\s+");
            int x=Integer.parseInt(start[0]),y=Integer.parseInt(start[1]);
            int direction=directions.indexOf(start[2]);
            String instructions=input.readLine().trim();boolean lost=false;
            for(int i=0;i<instructions.length();++i) {
                char command=instructions.charAt(i);
                if(command=='L') direction=(direction+3)%4;
                else if(command=='R') direction=(direction+1)%4;
                else {
                    int nx=x+dx[direction],ny=y+dy[direction];
                    if(nx<0||nx>maxX||ny<0||ny>maxY) {
                        if(!scent[x][y]) {scent[x][y]=true;lost=true;break;}
                    } else {x=nx;y=ny;}
                }
            }
            output.append(x).append(' ').append(y).append(' ').append(directions.charAt(direction));
            if(lost) output.append(" LOST");output.append('\n');
        }
        System.out.print(output);
    }
}

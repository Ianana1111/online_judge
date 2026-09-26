#include <stdio.h>
#include <stdlib.h>
#include <string.h>
typedef struct{int row,column;} Cell;
int main(void){
    int rows,columns,case_number=0;
    while(scanf("%d%d",&rows,&columns)==2&&(rows||columns)){
        int count=rows*columns;Cell *position=(Cell*)malloc(count*sizeof(Cell));
        for(int r=1;r<=rows;r++)for(int c=1;c<=columns;c++)position[(r-1)*columns+c-1]=(Cell){r,c};
        int operations;scanf("%d",&operations);
        while(operations--){
            char command[3];scanf("%2s",command);
            if(!strcmp(command,"EX")){
                Cell a,b;scanf("%d%d%d%d",&a.row,&a.column,&b.row,&b.column);
                for(int i=0;i<count;i++){Cell *cell=&position[i];if(cell->row==a.row&&cell->column==a.column)*cell=b;else if(cell->row==b.row&&cell->column==b.column)*cell=a;}
            }else{
                int k,indices[9];scanf("%d",&k);for(int i=0;i<k;i++)scanf("%d",&indices[i]);int insert=command[0]=='I',row=command[1]=='R';
                for(int i=0;i<count;i++){
                    Cell *cell=&position[i];if(cell->row<0)continue;int before=row?cell->row:cell->column,shift=0,deleted=0;
                    for(int j=0;j<k;j++){if(!insert&&indices[j]==before)deleted=1;if(insert?indices[j]<=before:indices[j]<before)shift+=insert?1:-1;}
                    if(deleted)*cell=(Cell){-1,-1};else if(row)cell->row+=shift;else cell->column+=shift;
                }
            }
        }
        if(case_number)putchar('\n');printf("Spreadsheet #%d\n",++case_number);int queries;scanf("%d",&queries);
        while(queries--){int r,c;scanf("%d%d",&r,&c);Cell now=position[(r-1)*columns+c-1];printf("Cell data in (%d,%d)",r,c);if(now.row<0)puts(" GONE");else printf(" moved to (%d,%d)\n",now.row,now.column);}
        free(position);
    }
    return 0;
}

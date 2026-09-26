import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input = new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tokens = new StringTokenizer("");
    static String next() throws Exception {
        while (!tokens.hasMoreTokens()) { String line = input.readLine(); if (line == null) return null; tokens = new StringTokenizer(line); }
        return tokens.nextToken();
    }
    static int stock(String text) {
        int value = 0;
        for (int i = text.startsWith("+") ? 1 : 0; i < text.length(); i++) { value = value*10+text.charAt(i)-'0'; if (value > 177) return 177; }
        return value;
    }
    static int solve(int[] stocks,int target) {
        int[] coins = {1,2,4,10,20,40}; if (target == 0) return 0;
        int paid = 0, count = 0;
        for (int i = 5; i >= 0; i--) { int needed = Math.max(0,(target-paid+coins[i]-1)/coins[i]), take = Math.min(stocks[i],needed); paid += take*coins[i]; count += take; }
        int[] change = new int[paid-target+1]; Arrays.fill(change,1000000); change[0] = 0;
        for (int amount = 1; amount < change.length; amount++) for (int coin : coins) if (coin <= amount) change[amount] = Math.min(change[amount],1+change[amount-coin]);
        int budget = count+change[paid-target], limit = 40*budget, infinity = budget+1;
        int[] own = new int[limit+1], shop = new int[limit-target+1]; Arrays.fill(own,infinity); Arrays.fill(shop,infinity); own[0] = shop[0] = 0;
        for (int i = 0; i < 6; i++) {
            int remaining = Math.min(stocks[i],budget),chunk = 1;
            while (remaining > 0) {
                int take = Math.min(chunk,remaining),worth = coins[i]*take;
                for (int amount = limit; amount >= worth; amount--) own[amount] = Math.min(own[amount],own[amount-worth]+take);
                remaining -= take; chunk *= 2;
            }
        }
        for (int amount = 1; amount < shop.length; amount++) for (int coin : coins) if (coin <= amount) shop[amount] = Math.min(shop[amount],1+shop[amount-coin]);
        int answer = budget;
        for (int amount = target; amount <= limit; amount++) answer = Math.min(answer,own[amount]+shop[amount-target]);
        return answer;
    }
    public static void main(String[] args) throws Exception {
        StringBuilder out = new StringBuilder();
        for (String first; (first = next()) != null;) {
            int[] stocks = new int[6]; stocks[0] = stock(first); boolean any = stocks[0] > 0;
            for (int i = 1; i < 6; i++) { stocks[i] = stock(next()); any |= stocks[i] > 0; }
            if (!any) break;
            String price = next(); int point = price.indexOf('.');
            int cents = 100*Integer.parseInt(point < 0 ? price : price.substring(0,point));
            if (point >= 0) { String fraction = price.substring(point+1)+"00"; cents += 10*(fraction.charAt(0)-'0')+fraction.charAt(1)-'0'; }
            out.append(String.format("%3d",solve(stocks,cents/5))).append('\n');
        }
        System.out.print(out);
    }
}

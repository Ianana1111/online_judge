import java.io.DataInputStream;
import java.io.IOException;

class Main {
    public static void main(String[] args) throws IOException {
        DataInputStream in = new DataInputStream(System.in);
        byte[] buffer = new byte[1 << 16];
        int length = 0, pos = 0;
        StringBuilder out = new StringBuilder();
        long n = 0;
        boolean inNumber = false;
        while (true) {
            if (pos == length) {
                length = in.read(buffer, 0, buffer.length);
                pos = 0;
                if (length <= 0) break;
            }
            byte b = buffer[pos++];
            if (b >= '0' && b <= '9') {
                n = n * 10 + (b - '0');
                inNumber = true;
            } else if (inNumber) {
                if (n == 0) break;
                long value = n <= 100 ? 91 : n - 10;
                out.append("f91(").append(n).append(") = ").append(value).append('\n');
                n = 0;
                inNumber = false;
            }
        }
        if (inNumber && n != 0) out.append("f91(").append(n).append(") = ").append(n <= 100 ? 91 : n - 10).append('\n');
        System.out.print(out);
    }
}

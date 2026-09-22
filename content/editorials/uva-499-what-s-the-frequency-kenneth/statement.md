#include &lt;stdio.h&gt;<br>
<br>
main()<br>
{<br>
  int i;<br>
  char \*suffix[]= { "st", "nd", "rd" };<br>
  char \*item[]= { "Unix" , "cat", "sed", "awk", "grep", "ed", "vi"};<br>
<br>
  printf("In the beginning, there was nothing.\n");<br>
  for (i= 0; i &lt; 7; i++)<br>
    printf("And on the %d%s day, God created %s. And it was good.\n",<br>
           i + 1, (i &lt; 3) ? suffix[i] : "th", item[i]);<br>
}

But then God saw that vi led people into temptation. Instead of choosing the righteous ways of make, dbx, and RCS, people used long command lines, printf(), and tape backups.

So God decreed, "I see that Engineers have thus defiled my vi. And so, I shall create *emacs*, an editor more powerful than words. Further, for each instantiation vi hitherto, the Engineer responsible shalt perform Penance. And lo, the Penance wilt be painful; there will be much wailing and gnushing of teeth. The Engineer will read many lines of text. For each line of text, the Engineer must tell me which letters occur the most frequently."

"I charge you all with My Golden Rule: 'Friends shalt not let friends use vi'."

### Input and Output

Each line of output should contain a list of letters that all occured with the highest frequency in the corresponding input line, followed by the frequency.

The list of letters should be an alphabetical list of upper case letters followed by an alphabetical list of lower case letters.

### LOCAL platform clarification

Count only ASCII A-Z and a-z, with case distinguished. If a line has no such letter, print an empty letter list followed by one space and 0. An empty input line is still a case.

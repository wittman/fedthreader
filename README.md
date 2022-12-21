# FedThreader
Turn a complete text thread into slices ready to copy and post.

### Live site: <a href="https://wittman.github.io/fedthreader/">FedThreader</a>

---

**How to Use**

<ol>
	<li><strong>Paste</strong> or <strong>type</strong> your thread text<br>
	<small>(Your text is immeadiatley sliced up for threaded posting)<br><br></small></li>
	<li>Click the first <strong><em>Copy</em></strong> button<br>
	<small>(To the right of each post slice)<br><br></small></li>
	<li>Go to your <strong>browser/app</strong> to paste and post</li>
	<li><strong>Come back</strong> here and <strong>repeat</strong> for each slice</li>
</ol>

---

### Example
**Configuration:**  
Maximum Characters per Post: **180**  
Add Pagination Marker: **Append**

### Text Input:
<blockquote>
Sweet Moon, I thank thee for thy sunny beams;<br>
I thank thee, Moon, for shining now so bright;<br>
For by thy gracious, golden, glittering gleams,<br>
I trust to take of truest Thisbe sight.<br>
But stay! O spite!<br>
But mark, poor knight,<br>
What dreadful dole is here!<br>
Eyes, do you see?<br>
How can it be?<br>
O dainty duck! O dear!<br>
Thy mantle good,<br>
What, stain’d with blood?<br>
Approach, ye Furies fell!<br>
O Fates, come, come,<br>
Cut thread and thrum,<br>
Quail, crush, conclude, and quell!
</blockquote>

### Output:

```
Sweet Moon, I thank thee for thy sunny beams;
I thank thee, Moon, for shining now so bright;
For by thy gracious, golden, glittering gleams,
I trust to take of truest Thisbe 1/3
```

```
sight.
But stay! O spite!
But mark, poor knight,
What dreadful dole is here!
Eyes, do you see?
How can it be?
O dainty duck! O dear!
Thy mantle good,
What, stain’d with 2/3
```

```
blood?
Approach, ye Furies fell!
O Fates, come, come,
Cut thread and thrum,
Quail, crush, conclude, and quell! 3/3
```

## Fine tuning
Let's add a couple “hard breaks” (two blank lines) before “I trust to take” and also “Thy mantle good”.

This prevents an orphan word in slices <small>2/3</small> and <small>3/3</small>.

<blockquote>
Sweet Moon, I thank thee for thy sunny beams;<br>
I thank thee, Moon, for shining now so bright;<br>
For by thy gracious, golden, glittering gleams,<br>
<br><br>
I trust to take of truest Thisbe sight.<br>
But stay! O spite!<br>
But mark, poor knight,<br>
What dreadful dole is here!<br>
Eyes, do you see?<br>
How can it be?<br>
O dainty duck! O dear!<br>
<br><br>
Thy mantle good,<br>
What, stain’d with blood?<br>
Approach, ye Furies fell!<br>
O Fates, come, come,<br>
Cut thread and thrum,<br>
Quail, crush, conclude, and quell!
</blockquote>

```
Sweet Moon, I thank thee for thy sunny beams;
I thank thee, Moon, for shining now so bright;
For by thy gracious, golden, glittering gleams, 1/3
```

```
I trust to take of truest Thisbe sight.
But stay! O spite!
But mark, poor knight,
What dreadful dole is here!
Eyes, do you see?
How can it be?
O dainty duck! O dear! 2/3
```

```
Thy mantle good,
What, stain’d with blood?
Approach, ye Furies fell!
O Fates, come, come,
Cut thread and thrum,
Quail, crush, conclude, and quell! 3/3
```

### Other Configuration

Checkmark `URLs only considered 23 characters long` to turn on special URL handling to get a more text into each post when large URLs are involved.
 
[Mastodon](https://mastodon.help) allows long URLs to only be consider 23 characters long—this option takes advantage of that.

URLs will be recognized as such if it begins with `https://` and is followed by a space or new line.

Avoid:
>Something (https://example.com/something)

by adding a space before the close parenthesis.
>Something ( https://example.com/something )

### Privacy

None of your data is sent to a remote server. 

Thread text and configuration are persisted in local storage (your device); your thread text is removed from local storage when you click the _Clear_ button.

### About

<p>Made by <a href="https://wittman.org">Micah Wittman</a>&nbsp;|&nbsp;<a rel="me" href="https://mastodon.social/@mwittman">mwittman@mastodon.social</a>, inspired by John Mastodon</p>
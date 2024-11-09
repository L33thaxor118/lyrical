// Require the lib, get a working terminal
var term = require( 'terminal-kit' ).terminal ;

term.clear()

// The term() function simply output a string to stdout, using current style
// output "Hello world!" in default terminal's colors
term( 'Hello world!\n' ) ;

// This output 'red' in red
term.red( 'red' ) ;

// This output 'bold' in bold
term.bold( 'bold' ) ;

// output 'mixed' using bold, underlined & red, exposing the style-mixing syntax
term.bold.underline.red( 'mixed' ) ;

// printf() style formatting everywhere:
// this will output 'My name is Jack, I'm 32.' in green
term.green( "My name is %s, I'm %d.\n" , 'Jack' , 32 ) ;

// Since v0.16.x, style markup are supported as a shorthand.
// Those two lines produce the same result.
term( "My name is " ).red( "Jack" )( " and I'm " ).green( "32\n" ) ;
term( "My name is ^rJack^ and I'm ^g32\n" ) ;

// Width and height of the terminal
term( 'The terminal size is %dx%d\n' , term.width , term.height ) ;

term.magenta( "Enter your name: " ) ;
term.inputField(
	function( error , input ) {
		term.green( "\nYour name is '%s'\n" , input ) ;
    term.nextLine(4)
    term("idk")
	}
) ;

setTimeout(()=>{
  process.exit()
}, 5000)
use std::fmt::Write;
use std::time::Instant;

#[derive(Debug, PartialEq, Eq)]
enum Token {
    Text(String),
    Command(Command),
}

#[derive(Debug, PartialEq, Eq)]
enum CommandType {
    Interpolate,
    Execution,
    Escape,
}

#[derive(Debug, PartialEq, Eq)]
enum WhitespaceType {
    Single,
    Multiple,
}

#[derive(Debug, PartialEq, Eq)]
struct Command {
   cmd_type: CommandType,
   content: String,
   dynamic: bool,
   opening_whitespace: Option<WhitespaceType>,
   closing_whitespace: Option<WhitespaceType>,
}

pub struct CommandParser {
    opening_tag: &'static str,
    closing_tag: &'static str,
}

impl CommandParser {
    pub fn new() -> Self {
          CommandParser {
              opening_tag: "<%",
              closing_tag: "%>",
          }   
    }

    fn tag<'a>(&self, i: &'a str, tag: &'a str) ->  Result<(&'a str, &'a str), &'static str> {
        match self.compare(i, tag) {
            true => {
                let (prefix, suffix) = i.split_at(tag.len());
                Ok ((suffix, prefix))
            },
            false => Err("No matching tag"),
        }
    }

    fn compare<'a>(&self, a: &str, b: &str) -> bool {
        let pos = a.as_bytes().iter()
            .zip(b.as_bytes().iter())
            .position(|(a, b)| {
                a != b
            });

        match pos {
            Some(_) => false,
            None => true,
        }
    }

    fn take<'a>(&self, i: &'a str, c: usize) ->  Result<(&'a str, &'a str), &'static str> {
        if c > i.len() {
            return Err("take out of input bounds");
        }
        let (prefix, suffix) = i.split_at(c);
        Ok((suffix, prefix))
    }

    fn take_until<'a>(&self, i: &'a str, tag: &'a str) ->  Result<(&'a str, &'a str), &'static str> {
        match i.find(tag) {
            Some(n) => {
                let (prefix, suffix) = i.split_at(n);
                Ok((suffix, prefix))
            },
            None => Err("Reached end of input, couldn't find tag"),
        }
    }

    fn escape_content(&self, i: &str) -> String {
        i.chars().fold(Vec::new(), |mut acc, c| { 
            match c {
                '\n' => {
                    acc.push('\\');
                    acc.push('n');
                }
                '\r' => {
                    acc.push('\\');
                    acc.push('r');
                },
                '\\' => {
                    acc.push('\\');
                    acc.push('\\');
                },
                '\'' => {
                    acc.push('\\');
                    acc.push('\'');
                },
                _ => acc.push(c),
            };
            acc
        }).iter().collect()
    }

    fn generate_javascript_function(&self, tokens: Vec<Token>) -> String {
        let it = Instant::now();

        let mut s = String::from("(async () => {\n");
        for token in tokens {
            match token {
                Token::Text(text) => {
                    write!(s, "tR+='{}';\n", text).unwrap();
                },
                Token::Command(c) => match c.cmd_type {
                    CommandType::Interpolate => {
                        write!(s, "tR+={};\n", c.content).unwrap()
                    },
                    CommandType::Execution => {
                        write!(s, "{};\n", c.content).unwrap();
                    },
                    CommandType::Escape => {
                        // TODO
                        write!(s, "tR+={};\n", c.content).unwrap();
                    }
                },
            }
        }
        write!(s, "}})()").unwrap();

        println!("generate_javascript_function: {:?}", it.elapsed());
        s
    }

    fn parse_tokens(&self, input: &str) -> Result<Vec<Token>, &'static str> {
        let it = Instant::now();

        let mut tokens = Vec::new(); 
        let mut inp = input;

        while let Ok((i, text)) = self.take_until(inp, self.opening_tag) {
            if text.len() > 0 {
                tokens.push(Token::Text(self.escape_content(text)));
            }

            let (i, _) = self.tag(i, self.opening_tag)?;
            let (i, cmd_type) = self.parse_command_type(i)?;
            let (i, dynamic) = self.parse_command_dynamic(i)?;
            let (i, opening_whitespace) = self.parse_command_whitespace(i)?;
            let (i, mut cmd_content) = self.take_until(i, self.closing_tag)?;
            let len = cmd_content.len();
            let mut closing_whitespace = None;
            if len > 2 {
                let (_, cw) = self.parse_command_whitespace(&cmd_content[len-1..len])?;
                if cw.is_some() {
                    cmd_content = &cmd_content[..len-1];
                }
                closing_whitespace = cw;
            }
            let (i, _) = self.tag(i, self.closing_tag)?;
            // Update inp for the next loop
            inp = i;

            let command = Command {
                cmd_type: cmd_type,
                content: self.escape_content(cmd_content),
                dynamic: dynamic,
                opening_whitespace: opening_whitespace,
                closing_whitespace: closing_whitespace,
            };

            tokens.push(Token::Command(command));
        }
        if inp.len() != 0 {
            //tokens.push(Token::Text(inp.to_string()));
            tokens.push(Token::Text(self.escape_content(inp)));
        }

        println!("parse_tokens: {:?}", it.elapsed());
        Ok(tokens)
    }

    fn parse_command_type<'a>(&self, i: &'a str) ->  Result<(&'a str, CommandType), &'static str> {
        let mut chars = i.chars().peekable();
        let c = chars.peek();
        match c {
            Some(&'*') => {
                let (i, _) = self.take(i, 1)?;
                Ok((i, CommandType::Execution))
            },
            Some(&'~') => {
                let (i, _) = self.take(i, 1)?;
                Ok((i, CommandType::Escape))
            },
            _ => Ok((i,CommandType::Interpolate))
        }
    }

    fn parse_command_dynamic<'a>(&self, i: &'a str) ->  Result<(&'a str, bool), &'static str> {
        let mut chars = i.chars().peekable();
        let c = chars.peek();
        if let Some(&'+') = c {
            let (i, _) = self.take(i, 1)?;
            Ok((i, true))
        } else {
            Ok((i, false))
        }
    }

    fn parse_command_whitespace<'a>(&self, i: &'a str) ->  Result<(&'a str, Option<WhitespaceType>), &'static str> {
        let mut chars = i.chars().peekable();
        let c = chars.peek();
        match c {
            Some(&'-') => {
                let (i, _) = self.take(i, 1)?;
                Ok((i, Some(WhitespaceType::Single)))
            },
            Some(&'_') => {
                let (i, _) = self.take(i, 1)?;
                Ok((i, Some(WhitespaceType::Multiple)))
            },
            _ => Ok((i, None))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    pub fn test_parse_interpolate_command() {
        let parser = CommandParser::new();
        let tokens = parser.parse_tokens("<% test %>").unwrap();

        assert_eq!(tokens, vec![
            Token::Command(Command {
                cmd_type: CommandType::Interpolate,
                content: String::from(" test "),
                dynamic: false,
                opening_whitespace: None,
                closing_whitespace: None,
            }),
        ]);
    }

    #[test]
    pub fn test_parse_execution_command() {
        let parser = CommandParser::new();
        let tokens = parser.parse_tokens("<%* test %>").unwrap();

        assert_eq!(tokens, vec![
            Token::Command(Command {
                cmd_type: CommandType::Execution,
                content: String::from(" test "),
                dynamic: false,
                opening_whitespace: None,
                closing_whitespace: None,
            }),
        ]);
    }

    #[test]
    pub fn test_parse_escape_command() {
        let parser = CommandParser::new();
        let tokens = parser.parse_tokens("<%~ test %>").unwrap();

        assert_eq!(tokens, vec![
            Token::Command(Command {
                cmd_type: CommandType::Escape,
                content: String::from(" test "),
                dynamic: false,
                opening_whitespace: None,
                closing_whitespace: None,
            }),
        ]);
    }

    #[test]
    pub fn test_parse_whitespace() {
        let parser = CommandParser::new();
        let tokens = parser.parse_tokens("<%~- test _%>\ntest\n<%*_ test -%>").unwrap();

        assert_eq!(tokens, vec![
            Token::Command(Command {
                cmd_type: CommandType::Escape,
                content: String::from(" test "),
                dynamic: false,
                opening_whitespace: Some(WhitespaceType::Single),
                closing_whitespace: Some(WhitespaceType::Multiple),
            }),
            Token::Text(String::from("\\ntest\\n")),
            Token::Command(Command {
                cmd_type: CommandType::Execution,
                content: String::from(" test "),
                dynamic: false,
                opening_whitespace: Some(WhitespaceType::Multiple),
                closing_whitespace: Some(WhitespaceType::Single),
            }),
        ]);
    }

    #[test]
    pub fn test_parse_dynamic_command() {
        let parser = CommandParser::new();
        let tokens = parser.parse_tokens("<%~+- test %>\ntest\n<%*+_ test %>test<%+ test %>").unwrap();

        assert_eq!(tokens, vec![
            Token::Command(Command {
                cmd_type: CommandType::Escape,
                content: String::from(" test "),
                dynamic: true,
                opening_whitespace: Some(WhitespaceType::Single),
                closing_whitespace: None,
            }),
            Token::Text(String::from("\\ntest\\n")),
            Token::Command(Command {
                cmd_type: CommandType::Execution,
                content: String::from(" test "),
                dynamic: true,
                opening_whitespace: Some(WhitespaceType::Multiple),
                closing_whitespace: None,
            }),
            Token::Text(String::from("test")),
            Token::Command(Command {
                cmd_type: CommandType::Interpolate,
                content: String::from(" test "),
                dynamic: true,
                opening_whitespace: None,
                closing_whitespace: None,
            }),
        ]);
    }

    #[test]
    pub fn test_parse_multiple_commands() {
        let parser = CommandParser::new();
        let tokens = parser.parse_tokens(r#"
test<% test _%>test
<%~- test _%>
test
<%*_ test -%> test <% test %>
"#).unwrap();

        assert_eq!(tokens, vec![
            Token::Text(String::from("\\ntest")),
            Token::Command(Command {
                cmd_type: CommandType::Interpolate,
                content: String::from(" test "),
                dynamic: false,
                opening_whitespace: None,
                closing_whitespace: Some(WhitespaceType::Multiple),
            }),
            Token::Text(String::from("test\\n")),
            Token::Command(Command {
                cmd_type: CommandType::Escape,
                content: String::from(" test "),
                dynamic: false,
                opening_whitespace: Some(WhitespaceType::Single),
                closing_whitespace: Some(WhitespaceType::Multiple),
            }),
            Token::Text(String::from("\\ntest\\n")),
            Token::Command(Command {
                cmd_type: CommandType::Execution,
                content: String::from(" test "),
                dynamic: false,
                opening_whitespace: Some(WhitespaceType::Multiple),
                closing_whitespace: Some(WhitespaceType::Single),
            }),
            Token::Text(String::from(" test ")),
            Token::Command(Command {
                cmd_type: CommandType::Interpolate,
                content: String::from(" test "),
                dynamic: false,
                opening_whitespace: None,
                closing_whitespace: None,
            }),
            Token::Text(String::from("\\n")),
        ]);
    }

    #[test]
    pub fn test_generate_javascript_function() {
        let parser = CommandParser::new();
        let tokens = parser.parse_tokens("<%~+- test %>\ntest\n<%*+_ test %>test<%+ test %>").unwrap();
        let js_func = parser.generate_javascript_function(tokens);

        assert_eq!(js_func, String::from(r#"(async () => {
tR+= test ;
tR+='\ntest\n';
 test ;
tR+='test';
tR+= test ;
})()"#));
    }
}

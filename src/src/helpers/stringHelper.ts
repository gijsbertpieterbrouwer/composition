/* eslint-disable no-useless-escape */
import { notifyMessage } from "@/notify";
import { translate } from "@/plugins/translatePlugin";
import useUserStore from "@/store/user";
import { LanguagePath } from "@/TickApi";

export const maxNameLength = 200;

export function calcInitials(input: string) {
  if (!input) { return "" }
  const allNames = input.trim().split(' ');
  const initials = allNames.reduce((acc, curr, index) => {
    if (index === 0 || index === allNames.length - 1) {
      acc = `${acc}${curr.charAt(0).toUpperCase()}`;
    }
    return acc;
  }, '');
  return initials;
}

export function numberToString(input: number) {
  if (!input) { return "" }

  return input.toLocaleString(useUserStore().locale.code);
}

export function stringToNumber(input: string | number) {
  if (!input) { return 0 }
  if (typeof (input) == 'string') {
    return parseInt(input)
  } else {
    return input;
  }
}

export function copyToClipboard(input: string | object) {
  try {


    if (!input) { return; }
    if (typeof (input) == 'object') { input = JSON.stringify(input); }


    if (navigator.clipboard) {
      navigator.clipboard.writeText(input);
      notifyMessage(translate(LanguagePath.App_Copy), translate(LanguagePath.App_CopiedToClipboard));
    } else {
      prompt("", input)
    }
  } catch (error) {
    notifyMessage("Oops", "Could not copy");
  }
}

export function stringIsNullOrEmpty(input?: string): boolean {
  if (!input || input?.trim().length === 0) {
    return true;
  } else {
    return false;
  }
}

export function splitStringMulti(str: string, inputTokens: string | string[]): string[] {
  let tokens: string[] = [];
  if (typeof (inputTokens) == 'string') {
    tokens = [inputTokens];
  } else {
    tokens = inputTokens;
  }

  const tempChar = tokens[0]; // We can use the first token as a temporary join character
  for (let i = 1; i < tokens.length; i++) {
    str = str.split(tokens[i]).join(tempChar);
  }

  let output = str.split(tempChar);
  output = output.map(s => s.trim());
  return output;
}

export function stringIsValidEmail(email: string) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}
export function stringIsValidPhoneNumber(phone: string) {
  if (!phone) { return; }

  phone = phone.trim();
  phone = replaceAll(phone, " ", "");

  const re = /^\+[1-9]\d{5,14}$/;///^\+[1-9]\d{1,14}$/;
  return re.test(phone);
}

export function stringIsValidWorkEmail(email: string): boolean {
  //const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const freeRegex = /^[\w-\.]+@([live+\.]|hotmail+\.]|[yahoo+\.]|[gmail+\.])+[\w-]{2,4}$/;

  if (!stringIsValidEmail(email)) {
    return false;
  }

  if (email.match(freeRegex)) {
    return false;
  }
  return true;
}

function eraseTokens(text: string) {
  const regex = /\{.*\}/;
  return text.replace(regex, "value");
}

export function trimTrailingChars(s: string, charToTrim: string) {
  const regExp = new RegExp(charToTrim + "+$");
  const result = s.replace(regExp, "");

  return result;
}

export function stringIsValidURL(str?: string) {
  if (!str || !str.length) { return false; }
  if (typeof (str) != 'string') { return false; }

  // discard curly braces
  str = eraseTokens(str);

  try {
    return Boolean(new URL(str));
  }
  catch (e) {
    return false;
  }
  // const pattern = new RegExp('^(http|https)://?' + // protocol
  //   '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
  //   '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
  //   '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
  //   '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
  //   '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

  // return !!pattern.test(str);
}

export function stringIsValidDomainName(str?: string) {
  if (!str || !str.length) { return false; }
  if (typeof (str) != 'string') { return false; }

  // discard curly braces
  str = eraseTokens(str);

  const pattern = new RegExp('[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+'); // fragment locator

  return !!pattern.test(str);

}


export function getHostNameFromUrl(inputUrl: string) {
  const tmp = document.createElement('a');
  tmp.href = inputUrl;
  return tmp.hostname;
}

export function getDomainNameFromUrl(url: string) {
  let domain = url;
  if (url.includes("://")) {
    domain = url.split('://')[1];
  }
  const subdomain = domain.split('.')[0];
  return subdomain;
}


export function getStringChecksum(s: string): string {
  let chk = 0x12345678;
  const len = s.length;
  for (let i = 0; i < len; i++) {
    chk += (s.charCodeAt(i) * (i + 1));
  }

  return (chk & 0xffffffff).toString(16);
}

export function isCharDigit(n: string) {
  return !!n.trim() && !isNaN(+n);
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function replaceAll(str: string, find: string | string[], replace: string) {
  if (typeof (find) == 'string') {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
  } else {
    for (let index = 0; index < find.length; index++) {
      const f = find[index];
      str = str.replace(new RegExp(escapeRegExp(f), 'g'), replace);
    }
    return str;
  }

}

// export function markdownToHtml(src:string)
// {
//   // copy of https://github.com/p01/mmd.js/blob/master/mmd.js

// 	let h='';

// 	function escape(t:any)
// 	{
// 		return new Option(t).innerHTML;
// 	}
// 	function inlineEscape(s:any)
// 	{
// 		return escape(s)
// 			.replace(/!\[([^\]]*)]\(([^(]+)\)/g, '<img alt="$1" src="$2">')
// 			.replace(/\[([^\]]+)]\(([^(]+?)\)/g, '$1'.link('$2'))
// 			.replace(/`([^`]+)`/g, '<code>$1</code>')
// 			.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g, '<strong>$2</strong>')
// 			.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g, '<em>$2</em>');
// 	}

// 	src
// 	.replace(/^\s+|\r|\s+$/g, '')
// 	.replace(/\t/g, '    ')
// 	.split(/\n\n+/)
// 	.forEach(function(b, f, R)
// 	{
// 		f=b[0];
// 		R=
// 		{
// 			'*':[/\n\* /,'<ul><li>','</li></ul>'],
// 			'1':[/\n[1-9]\d*\.? /,'<ol><li>','</li></ol>'],
// 			' ':[/\n    /,'<pre><code>','</code></pre>','\n'],
// 			'>':[/\n> /,'<blockquote>','</blockquote>','\n']
// 		}[f];
// 		h+=
// 			R?R[1]+('\n'+b)
// 				.split(R[0])
// 				.slice(1)
// 				.map(R[3]?escape:inlineEscape)
// 				.join(R[3]||'</li>\n<li>')+R[2]:
// 			f=='#'?'<h'+(f=b.indexOf(' '))+'>'+inlineEscape(b.slice(f+1))+'</h'+f+'>':
// 			f=='<'?b:
// 			'<p>'+inlineEscape(b)+'</p>';
// 	});
// 	return h;
// };
"""
 # Copyright (c) 2017 Boolein Integer Indonesia, PT.
 # suryakencana 2/19/17 @author nanang.suryadi@boolein.id
 #
 # You are hereby granted a non-exclusive, worldwide, royalty-free license to
 # use, copy, modify, and distribute this software in source code or binary
 # form for use in connection with the web services and APIs provided by
 # Boolein.
 #
 # As with any software that integrates with the Boolein platform, your use
 # of this software is subject to the Boolein Developer Principles and
 # Policies [http://developers.Boolein.com/policy/]. This copyright notice
 # shall be included in all copies or substantial portions of the software.
 #
 # THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 # IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 # FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 # THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 # LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 # FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 # DEALINGS IN THE SOFTWARE
 # 
 # helper
"""
import binascii
import hashlib
import os
import random
import string
from baka._compat import text_type


def generate_random_string(length=12):
    """Generate a random ascii string of the requested length."""
    msg = hashlib.sha256()
    word = ''
    for _ in range(length):
        word += random.choice(string.ascii_letters)
    msg.update(word.encode('ascii'))
    return text_type(msg.hexdigest()[:length])


def _token():
    """Return a random string suitable for use in an API token."""
    return binascii.hexlify(os.urandom(16))

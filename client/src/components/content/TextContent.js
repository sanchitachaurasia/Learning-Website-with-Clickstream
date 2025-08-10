import React from 'react';

export default function TextContent({ data }) {
  return (
    <div className="prose max-w-none">
        <p>{data.body}</p>
    </div>
  );
}